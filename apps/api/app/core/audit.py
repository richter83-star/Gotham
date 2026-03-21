import functools
import uuid
from typing import Any, Callable
from app.models.audit import ActionLog
from sqlalchemy.orm import Session

def audit_action(action: str, resource_type: str = None):
    """
    Decorator to log sensitive actions to the audit log.
    Expects 'db' and 'current_user' in kwargs or arguments.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # Extract DB and Current User (simplified for skeleton)
            db = kwargs.get('db')
            current_user = kwargs.get('current_user')
            
            if db and current_user:
                # Basic resource_id extraction (if result has .id)
                resource_id = getattr(result, 'id', None)
                
                log_entry = ActionLog(
                    tenant_id=current_user.tenant_id,
                    user_id=current_user.id,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details={"result": "success"}
                )
                db.add(log_entry)
                db.commit()
            
            return result
        return wrapper
    return decorator
