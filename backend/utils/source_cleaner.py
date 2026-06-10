def clean_results(
    results
):

    cleaned = []

    seen_urls = set()

    for item in results:

        url = item.get(
            "url",
            ""
        )

        if url in seen_urls:
            continue

        seen_urls.add(url)

        cleaned.append(
            {
                "title": item.get(
                    "title",
                    ""
                ),
                "url": url,
                "content": item.get(
                    "content",
                    ""
                )[:3000]
            }
        )

    return cleaned