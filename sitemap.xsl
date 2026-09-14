<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="it">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Ronaldo Riska — XML Sitemap</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8f9fa;
            color: #212529;
            line-height: 1.6;
            padding: 40px 20px;
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          header {
            background: #1a1f3a;
            color: #ffffff;
            padding: 32px 40px;
            border-bottom: 3px solid #ff2d6f;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 6px;
            letter-spacing: -0.02em;
          }
          header p {
            font-size: 14px;
            color: #b8c5d6;
            margin-bottom: 16px;
          }
          .summary {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            padding: 6px 14px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead {
            background: #f1f3f5;
          }
          th {
            padding: 14px 20px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
          }
          td {
            padding: 12px 20px;
            font-size: 14px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
          }
          tbody tr:hover {
            background: #f8f9ff;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .date {
            color: #6c757d;
            font-size: 13px;
            white-space: nowrap;
          }
          footer {
            padding: 20px 40px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
            font-size: 12px;
            color: #868e96;
            text-align: center;
          }
          @media (max-width: 640px) {
            body { padding: 0; }
            .container { border-radius: 0; box-shadow: none; }
            header { padding: 24px 16px; }
            h1 { font-size: 20px; }
            th, td { padding: 10px 12px; font-size: 13px; }
            th:not(:first-child), td:not(:first-child) { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Ronaldo Riska — XML Sitemap</h1>
            <p>Search engine sitemap · Human-readable view</p>
            <span class="summary">Total URLs: <xsl:value-of select="count(s:urlset/s:url)"/></span>
          </header>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td>
                    <a href="{s:loc}">
                      <xsl:value-of select="s:loc"/>
                    </a>
                  </td>
                  <td class="date">
                    <xsl:value-of select="s:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <footer>XML sitemap generated for Ronaldo Riska</footer>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
