REQUIRED_SECTIONS = [
    "Executive Summary",
    "Key Findings",
    "Technical Analysis",
    "Risks",
    "Recommendations",
    "Sources"
]


def validate_report(
    report: str
):

    missing = []

    for section in REQUIRED_SECTIONS:

        if section not in report:
            missing.append(section)

    return missing