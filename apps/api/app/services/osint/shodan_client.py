import os
import shodan
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ShodanScanner:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SHODAN_API_KEY")
        self.client = shodan.Shodan(self.api_key) if self.api_key else None
        if not self.client:
            logger.warning("SHODAN_API_KEY not found. Running in MOCK Mode.")

    async def scan_ip(self, ip: str) -> Dict[str, Any]:
        """
        Scan a specific IP address using Shodan.
        Returns host data including ports, services, and vulnerabilities.
        """
        if not self.client:
            # Mock Data for Development/No API Key
            return {
                "ip": ip,
                "ports": [80, 443, 8080, 22],
                "vulns": ["CVE-2021-41773", "CVE-2024-1234"],
                "org": "Wayne Enterprises Infrastructure",
                "os": "Linux 5.x",
                "is_mock": True
            }

        try:
            host = self.client.host(ip)
            return {
                "ip": host.get('ip_str'),
                "ports": host.get('ports', []),
                "vulns": host.get('vulns', []),
                "org": host.get('org', 'Unknown'),
                "os": host.get('os', 'Unknown'),
                "is_mock": False
            }
        except shodan.APIError as e:
            logger.error(f"Shodan API Error: {e}")
            return {"error": str(e)}

shodan_scanner = ShodanScanner()
