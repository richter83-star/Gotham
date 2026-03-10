"""
AI Investigator Assist Service
Wraps Anthropic Claude for:
  - Entity extraction from raw text
  - Case summarization
  - Link suggestions
  - Next-action recommendations
  - Report drafting
"""
import anthropic
from app.core.config import get_settings

settings = get_settings()
_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def extract_entities(text: str) -> dict:
    """Extract structured entities from raw investigation text."""
    client = get_client()
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=EXTRACTION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Extract entities from the following text:\n\n{text}"}],
    )
    return {"raw": response.content[0].text}


async def summarize_case(case_context: dict) -> str:
    """Generate a structured narrative summary for a case."""
    client = get_client()
    context_str = _format_case_context(case_context)
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SUMMARIZATION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": context_str}],
    )
    return response.content[0].text


async def recommend_next_actions(case_context: dict) -> list[dict]:
    """Suggest the next best investigative actions for a case."""
    client = get_client()
    context_str = _format_case_context(case_context)
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=NEXT_ACTION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": context_str}],
    )
    return [{"recommendation": response.content[0].text}]


async def draft_report(case_context: dict) -> str:
    """Draft a formal investigation report."""
    client = get_client()
    context_str = _format_case_context(case_context)
    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=REPORT_DRAFT_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": context_str}],
    )
    return response.content[0].text


def _format_case_context(ctx: dict) -> str:
    lines = [f"Case: {ctx.get('case_number', 'Unknown')} — {ctx.get('title', '')}"]
    if ctx.get("description"):
        lines.append(f"Description: {ctx['description']}")
    if ctx.get("entities"):
        lines.append(f"Entities: {', '.join(ctx['entities'])}")
    if ctx.get("notes"):
        lines.append("Notes:\n" + "\n".join(f"- {n}" for n in ctx["notes"]))
    if ctx.get("evidence"):
        lines.append("Evidence:\n" + "\n".join(f"- {e}" for e in ctx["evidence"]))
    return "\n".join(lines)


# ── System prompts (see docs/ai/system_prompts.md for full versions) ──────────

EXTRACTION_SYSTEM_PROMPT = """\
You are an expert investigative analyst. Extract structured entities from the provided text.
Return a JSON object with these keys:
- persons: list of {name, aliases, identifiers (ssn, passport, email, phone), notes}
- organizations: list of {name, aliases, registration_number, jurisdiction}
- accounts: list of {account_number, bank, iban, type}
- locations: list of {address, city, country, coordinates}
- transactions: list of {amount, currency, date, from_account, to_account, reference}
- devices: list of {type, identifier, ip_address, mac_address}
- dates: list of {date, context}

Preserve provenance: note the exact text snippet each entity was extracted from.
If uncertain, include a confidence score (0.0–1.0) on each item.
Only return valid JSON."""

SUMMARIZATION_SYSTEM_PROMPT = """\
You are a senior fraud investigator writing case summaries for internal review.
Given the case context, write a concise structured summary with these sections:
1. **Executive Summary** (2-3 sentences)
2. **Key Entities** (bullet list with roles)
3. **Timeline of Key Events** (chronological)
4. **Evidence Strength** (high / medium / low with rationale)
5. **Open Questions** (what is still unknown)

Be precise, factual, and cite evidence items where possible.
Do not speculate beyond what the evidence supports."""

NEXT_ACTION_SYSTEM_PROMPT = """\
You are an experienced investigations case manager. Given the current case state,
recommend the 3-5 most valuable next investigative actions.

For each action include:
- action_type: one of [request_records, interview_subject, cross_reference_database,
  escalate_to_law_enforcement, freeze_account, obtain_warrant, close_case,
  request_more_evidence, flag_for_review, run_entity_search]
- rationale: why this action is warranted
- priority: high / medium / low
- estimated_impact: what it would unlock if completed

Ground all recommendations in the case evidence. Do not recommend actions
that are already completed."""

REPORT_DRAFT_SYSTEM_PROMPT = """\
You are a professional investigations report writer. Draft a formal investigation report
suitable for internal compliance, legal review, or regulatory submission.

Report structure:
1. Report Metadata (case number, date, prepared by, classification)
2. Executive Summary
3. Background & Scope
4. Methodology
5. Findings (organized by entity and timeline)
6. Evidence Summary (with provenance)
7. Conclusion & Determination
8. Recommended Actions
9. Appendices (entity profiles, relationship map description)

Maintain professional, neutral tone. Cite evidence items inline using [E-001] notation.
Flag any areas where evidence is incomplete or conflicting."""
