import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// 动态 OG 分享图：/og?title=文章标题（无参数时输出站点默认卡片）

const WIDTH = 1200
const HEIGHT = 630

// satori 默认字体不含 CJK——按标题文本拉取 Google Fonts 子集，避免中文变方块
async function loadCjkFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&text=${encodeURIComponent(text)}`
    const css = await fetch(url, {
      headers: {
        // 需要非现代 UA 才会返回可直链的 truetype/opentype
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:20.0) Gecko/20100101 Firefox/20.0',
      },
    }).then((res) => res.text())

    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)
    if (!match) return null

    return await fetch(match[1]).then((res) => res.arrayBuffer())
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawTitle = searchParams.get('title')
  const title = (rawTitle || "LouWill's Tech Blog").slice(0, 100)
  const subtitle = rawTitle
    ? "LouWill's Tech Blog"
    : 'AI Algorithm Engineer & Full Stack Developer'

  const fontData = await loadCjkFont(`${title}${subtitle}$ cat post.md_`)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0e14',
          padding: '64px 72px',
          fontFamily: fontData ? 'NotoSansSC' : 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#ff5f57' }} />
            <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#febc2e' }} />
            <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#28c840' }} />
          </div>
          <div style={{ color: '#4d5566', fontSize: 28 }}>louwill.com</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ color: '#5ccfe6', fontSize: 32, display: 'flex' }}>
            $ cat post.md
          </div>
          <div
            style={{
              color: '#e6e6e6',
              fontSize: title.length > 40 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.25,
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#8a919d', fontSize: 30, display: 'flex' }}>{subtitle}</div>
          <div style={{ color: '#5ccfe6', fontSize: 30, display: 'flex' }}>_</div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      ...(fontData
        ? { fonts: [{ name: 'NotoSansSC', data: fontData, weight: 700 as const, style: 'normal' as const }] }
        : {}),
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    }
  )
}
