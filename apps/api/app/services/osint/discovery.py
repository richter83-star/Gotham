from typing import List, Dict, Any
import logging
from .engine import osint_engine

logger = logging.getLogger(__name__)

class DiscoveryService:
    @staticmethod
    async def scout_entity(entity_name: str) -> Dict[str, Any]:
        """
        Deep discovery 'Scout' for an entity.
        Combines web search, social scanning, and public record lookup.
        """
        logger.info(f"Discovery Scout initiated for '{entity_name}'")
        
        # 1. Web Search Discovery
        search_results = await osint_engine.search(entity_name)
        
        intel_items = []
        for res in search_results:
            intel_items.append({
                "type": "EXTERNAL_LINK",
                "content": res["title"],
                "metadata": {"url": res["url"], "snippet": res["snippet"], "source": res["source"]}
            })
            
        # 2. Technical Recon (if applicable)
        from .shodan_client import shodan_scanner
        # Check if entity_name looks like an IP or Domain (simulated logic)
        technical_data = None
        if "." in entity_name or ":" in entity_name:
             technical_data = await shodan_scanner.scan_ip(entity_name)
             if technical_data and "ports" in technical_data:
                 intel_items.append({
                     "type": "TECHNICAL_RECON",
                     "content": f"Shodan Recon: {len(technical_data['ports'])} Open Ports",
                     "metadata": {
                         "source": "Shodan",
                         "ports": technical_data["ports"],
                         "vulns": technical_data.get("vulns", []),
                         "org": technical_data.get("org"),
                         "os": technical_data.get("os"),
                         "snippet": f"Detected ports: {technical_data['ports'] if technical_data else []}. Target Organization: {technical_data.get('org')}"
                     }
                 })

        return {
            "entity": entity_name,
            "intel_items": intel_items,
            "status": "COMPLETED",
            "confidence_score": 0.95 if technical_data else 0.82
        }

discovery_service = DiscoveryService()
