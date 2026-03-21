from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.rule import Rule

def evaluate_condition(condition: Dict[str, Any], event: Dict[str, Any]) -> bool:
    """
    Evaluates a JSON logic condition against an incoming event payload.
    Supports complex nesting with AND/OR.
    """
    if "AND" in condition:
        return all(evaluate_condition(c, event) for c in condition["AND"])
    if "OR" in condition:
        return any(evaluate_condition(c, event) for c in condition["OR"])

    field_path = condition.get("field")
    operator = condition.get("operator")
    target_value = condition.get("value")

    if not field_path or not operator:
        return False

    # Extract nested fields like "transaction.amount"
    parts = field_path.split(".")
    val = event
    for p in parts:
        if isinstance(val, dict):
            val = val.get(p)
        else:
            val = None
            break

    if val is None:
        return False

    if operator == "==":
        return val == target_value
    elif operator == "!=":
        return val != target_value
    elif operator == ">":
        return float(val) > float(target_value)
    elif operator == "<":
        return float(val) < float(target_value)
    elif operator == "CONTAINS":
        return str(target_value).lower() in str(val).lower()
        
    return False

def evaluate_event_stream(db: Session, tenant_id: str, event_payload: Dict[str, Any]) -> List[Rule]:
    """
    Takes an incoming event map, pulls active rules for the tenant, evaluates them synchronously.
    Returns a list of triggered rules.
    """
    active_rules = db.query(Rule).filter(Rule.tenant_id == tenant_id, Rule.is_active == True).all()
    triggered = []
    
    for rule in active_rules:
        try:
            is_hit = evaluate_condition(rule.condition_json, event_payload)
            if is_hit:
                triggered.append(rule)
        except Exception as e:
            print(f"Error evaluating rule {rule.id}: {e}")
            
    return triggered
