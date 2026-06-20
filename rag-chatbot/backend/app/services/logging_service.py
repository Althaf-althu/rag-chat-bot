import logging
import sys
import os
import json
from datetime import datetime

class StructuredJSONFormatter(logging.Formatter):
    def format(self, record):
        log_object = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno
        }
        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_object)

class LoggingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LoggingService, cls).__new__(cls)
            log_level = getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper(), logging.INFO)
            
            logger = logging.getLogger("RAG_SYSTEM_ENGINE")
            logger.setLevel(log_level)
            logger.handlers = [] # Clear handlers
            
            stdout_handler = logging.StreamHandler(sys.stdout)
            stdout_handler.setFormatter(StructuredJSONFormatter())
            logger.addHandler(stdout_handler)
            
            file_handler = logging.FileHandler("./logs/app.log")
            file_handler.setFormatter(StructuredJSONFormatter())
            logger.addHandler(file_handler)
            
            cls._instance.logger = logger
        return cls._instance

    def info(self, msg: str, *args, **kwargs):
        self.logger.info(msg, *args, **kwargs)

    def warning(self, msg: str, *args, **kwargs):
        self.logger.warning(msg, *args, **kwargs)

    def error(self, msg: str, *args, **kwargs):
        self.logger.error(msg, *args, **kwargs)