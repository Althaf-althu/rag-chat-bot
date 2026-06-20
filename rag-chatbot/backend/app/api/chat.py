import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import datetime

from app.database.session import get_db
from app.models.schemas import ChatQueryRequest, ChatMessageResponse
from app.models.db_models import DBChatSession, DBChatMessage, DBActiveDocument
from app.services.retrieval_service import RetrievalService
from app.services.chat_services import ChatService

router = APIRouter(prefix="/chat", tags=["AI Core Conversation Engine Interfaces"])

@router.post("", response_model=None)
async def submit_query_message_stream(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db),
    retrieval_service: RetrievalService = Depends(),
    chat_service: ChatService = Depends()
):
    session = db.query(DBChatSession).filter(DBChatSession.id == payload.session_id).first()
    if not session:
        session = DBChatSession(id=payload.session_id)
        db.add(session)
        db.commit()

    # Step 1: Query persistent vector collections for relevant context
    has_docs = db.query(DBActiveDocument).count() > 0
    context = ""
    citations = []
    
    if has_docs:
        context, citations = retrieval_service.retrieve_context(payload.message, top_k=payload.top_k)

    # Step 2: Build standard context prompts matching open instruction structures
    system_instruction = (
        "You are an authentic, adaptive AI collaborator. Use the provided Context Blocks to accurately answer user inquiries. "
        "If you do not know the answer based on the context, state that you cannot answer based on available documents.\n\n"
        f"CONTEXT INFORMATION:\n{context}\n"
    )
    
    # Pull trailing records for sliding window configurations
    history_messages = db.query(DBChatMessage).filter(DBChatMessage.session_id == payload.session_id).order_by(DBChatMessage.timestamp.asc()).all()
    history_str = ""
    for msg in history_messages[-6:]:
        history_str += f"{msg.role.upper()}: {msg.content}\n"
        
    full_prompt = f"System: {system_instruction}\nHistory:\n{history_str}\nUSER: {payload.message}\nASSISTANT:"

    # Save initial user response metrics directly into db storage layouts
    user_msg_id = str(uuid.uuid4())
    db_user_msg = DBChatMessage(
        id=user_msg_id,
        session_id=payload.session_id,
        role="user",
        content=payload.message,
        citations=json.dumps([])
    )
    db.add(db_user_msg)
    db.commit()

    async def event_generator():
        assistant_tokens = []
        async for chunk in chat_service.stream_chat_response(full_prompt, model_id=payload.model_id):
            if "error" in chunk:
                yield chunk
                return
            
            if "[DONE]" in chunk:
                # Compile complete trace context inside structural engines once sequence terminations arrive
                full_text = "".join(assistant_tokens)
                assist_id = str(uuid.uuid4())
                db_assist_msg = DBChatMessage(
                    id=assist_id,
                    session_id=payload.session_id,
                    role="assistant",
                    content=full_text,
                    citations=json.dumps(citations)
                )
                db.add(db_assist_msg)
                db.commit()
                
                yield f"data: {json.dumps({'metadata': {'id': assist_id, 'citations': citations}})}\n\n"
                yield "data: [DONE]\n\n"
                break
                
            try:
                # Strip leading SSE syntax to track token components raw text
                data_json = json.loads(chunk.replace("data: ", "").strip())
                token = data_json.get("token", "")
                assistant_tokens.append(token)
            except Exception:
                pass
                
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/history", response_model=list[ChatMessageResponse])
def get_paginated_history(
    session_id: str = Query(..., min_length=1),
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    messages = db.query(DBChatMessage).filter(DBChatMessage.session_id == session_id).order_by(DBChatMessage.timestamp.asc()).offset(offset).limit(limit).all()
    
    response = []
    for m in messages:
        try:
            c_list = json.loads(m.citations) if m.citations else []
        except Exception:
            c_list = []
            
        response.append(ChatMessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            citations=c_list,
            timestamp=m.timestamp
        ))
    return response

@router.delete("/history")
def clear_session_chat_history(session_id: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    db.query(DBChatMessage).filter(DBChatMessage.session_id == session_id).delete()
    db.commit()
    return {"detail": "Chat architecture history erased successfully for current session tokens."}