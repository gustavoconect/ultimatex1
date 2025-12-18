const MANUAL_MAPPING: Record<string, string> = {
    "Wukong": "MonkeyKing",
    "Kog'Maw": "KogMaw",
    "Rek'Sai": "RekSai",
    "Cho'Gath": "Chogath",
    "Kai'Sa": "Kaisa",
    "Kha'Zix": "Khazix",
    "LeBlanc": "Leblanc",
    "Vel'Koz": "Velkoz",
    "Bel'Veth": "Belveth",
    "Nunu & Willump": "Nunu",
    "Renata Glasc": "Renata",
    "Dr. Mundo": "DrMundo",
    "Jarvan IV": "JarvanIV",
    "Master Yi": "MasterYi",
    "Lee Sin": "LeeSin",
    "Tahm Kench": "TahmKench",
    "Aurelion Sol": "AurelionSol",
    "Miss Fortune": "MissFortune",
    "Twisted Fate": "TwistedFate",
    "Xin Zhao": "XinZhao",
};

export async function getLatestVersion(): Promise<string> {
    try {
        const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions = await res.json();
        return versions[0];
    } catch {
        return "15.24.1"; // Fallback
    }
}

export async function getChampionsData(version: string): Promise<Record<string, { name: string; id: string }>> {
    try {
        const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
        const json = await res.json();
        return json.data;
    } catch {
        return {};
    }
}

export function getChampionIdByName(
    championName: string,
    championsData: Record<string, { name: string; id: string }>
): string {
    if (MANUAL_MAPPING[championName]) {
        return MANUAL_MAPPING[championName];
    }

    if (championsData[championName]) {
        return championName;
    }

    for (const [champId, data] of Object.entries(championsData)) {
        if (data.name === championName || data.name.toLowerCase() === championName.toLowerCase()) {
            return champId;
        }
    }

    return championName;
}

export function getChampionImageUrl(
    championName: string,
    version: string,
    championsData: Record<string, { name: string; id: string }>
): string {
    const champId = getChampionIdByName(championName, championsData);
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champId}.png`;
}
