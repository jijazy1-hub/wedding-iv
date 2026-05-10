import { ImageResponse } from 'next/og';
import { findGuestByUniqueCode } from '@/lib/airtable';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

// Fetch a font in TTF format via old-UA Google Fonts trick, with fallback
async function fetchFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(
      `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}`,
      { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)' } }
    )).text();
    const url = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

function safe(s: string): string {
  return (s ?? '').replace(/[^\x20-\x7E]/g, '').trim();
}

export async function POST(req: Request) {
  try {
    const body        = await req.json();
    const code        = String(body.code ?? '').trim();
    const imageBase64 = body.imageBase64 as string | null ?? null;

    if (!code) return Response.json({ error: 'Code required' }, { status: 400 });

    const guest = await findGuestByUniqueCode(code);
    if (!guest) return Response.json({ error: 'Guest not found' }, { status: 404 });

    const [qrDataUrl, fontScript, fontBold, fontRegular] = await Promise.all([
      QRCode.toDataURL(code, {
        margin: 2, width: 220,
        color: { dark: '#0A2810', light: '#F8F4E3' },
      }),
      fetchFont('Great Vibes', 400),
      fetchFont('Cormorant Garamond', 700),
      fetchFont('Cormorant Garamond', 400),
    ]);

    const title = safe(process.env.NEXT_PUBLIC_WEDDING_TITLE  ?? 'Gabby & Esther');
    const date  = safe(process.env.NEXT_PUBLIC_WEDDING_DATE   ?? 'Saturday, 14th December 2024');
    const venue = safe(process.env.NEXT_PUBLIC_WEDDING_VENUE  ?? 'The Grand Ballroom, Eko Hotel & Suites');
    const time  = safe(process.env.NEXT_PUBLIC_WEDDING_TIME   ?? '12:00 PM');
    const name  = safe(guest.Name);
    const seat  = safe(String(guest.Seat_Number ?? 'TBA'));
    const ucode = safe(guest.Unique_Code ?? code);
    const tag   = '#' + safe(title.replace(/\s*&\s*/g, 'And').replace(/\s/g, '')) + '2024';

    const BG      = '#F8F4E3';
    const GREEN   = '#0A2810';
    const GOLD    = '#B8860B';
    const GOLDLT  = '#D4A843';
    const GOLDPAL = '#F0DFA0';
    const INK     = '#1A1208';
    const INKLT   = '#4A3D2A';
    const W = 800, H = 1150;

    type W = 100|200|300|400|500|600|700|800|900;
    const fonts: { name: string; data: ArrayBuffer; weight: W; style: 'normal' }[] = [];
    if (fontScript)  fonts.push({ name: 'Script',  data: fontScript,  weight: 400 as W, style: 'normal' });
    if (fontBold)    fonts.push({ name: 'Serif',   data: fontBold,    weight: 700 as W, style: 'normal' });
    if (fontRegular) fonts.push({ name: 'Serif',   data: fontRegular, weight: 400 as W, style: 'normal' });

    const scriptFamily  = fontScript  ? 'Script' : 'serif';
    const serifFamily   = fontBold    ? 'Serif'  : 'serif';

    return new ImageResponse(
      (
        <div style={{
          display: 'flex', width: W, height: H,
          background: BG, position: 'relative',
          fontFamily: serifFamily,
        }}>
          {/* Outer dark border */}
          <div style={{
            position: 'absolute',
            top: 10, left: 10, right: 10, bottom: 10,
            border: `3px solid ${GREEN}`,
            display: 'flex',
          }} />

          {/* Inner gold hairline */}
          <div style={{
            position: 'absolute',
            top: 20, left: 20, right: 20, bottom: 20,
            border: `1px solid ${GOLD}`,
            display: 'flex',
          }} />

          {/* Corner diamonds — using explicit top/left/right/bottom */}
          <div style={{ position: 'absolute', top: 9, left: 9,   width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', top: 9, right: 9,  width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: 9, left: 9,  width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: 9, right: 9, width: 10, height: 10, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />

          {/* All content */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '36px 44px 28px', gap: 0 }}>

            {/* HEADER */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: 8, color: GOLDLT, fontWeight: 700 }}>
                WEDDING  INVITATION
              </div>
              <div style={{ fontSize: 74, color: '#7A5C00', fontFamily: scriptFamily, lineHeight: 1.1, marginTop: 2 }}>
                {title}
              </div>
              <div style={{ width: 480, height: 1, background: GOLD, marginTop: 4 }} />
              <div style={{ fontSize: 13, color: INKLT, fontStyle: 'italic', marginTop: 6 }}>
                Together with their families, request the pleasure of your company
              </div>
            </div>

            {/* EVENT BAR */}
            <div style={{ display: 'flex', marginTop: 20, border: `1px solid ${GOLD}`, background: '#F0E8C8' }}>
              {/* DATE */}
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: 6 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, fontWeight: 700, color: GOLDLT }}>DATE</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, textAlign: 'center' }}>{date}</div>
              </div>
              {/* Divider */}
              <div style={{ width: 1, background: GOLDLT, alignSelf: 'stretch', display: 'flex' }} />
              {/* TIME */}
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: 6 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, fontWeight: 700, color: GOLDLT }}>TIME</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{time}</div>
              </div>
              {/* Divider */}
              <div style={{ width: 1, background: GOLDLT, alignSelf: 'stretch', display: 'flex' }} />
              {/* VENUE */}
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: 6 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, fontWeight: 700, color: GOLDLT }}>VENUE</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: INK, textAlign: 'center' }}>{venue}</div>
              </div>
            </div>

            {/* RSVP label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
              <div style={{ flex: 1, height: 1, background: GOLD }} />
              <div style={{ fontSize: 11, letterSpacing: 7, fontWeight: 700, color: GOLDLT }}>RSVP ADMISSION CARD</div>
              <div style={{ flex: 1, height: 1, background: GOLD }} />
            </div>

            {/* MAIN BODY */}
            <div style={{ display: 'flex', gap: 28, marginTop: 20, flex: 1 }}>

              {/* PHOTO */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {imageBase64 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: GREEN, padding: 6, display: 'flex' }}>
                      <div style={{ border: `2px solid ${GOLD}`, padding: 3, display: 'flex', background: 'white' }}>
                        <img src={imageBase64} width={228} height={278} style={{ display: 'block' }} />
                      </div>
                    </div>
                    <div style={{ background: GREEN, display: 'flex', justifyContent: 'center', paddingTop: 6, paddingBottom: 6 }}>
                      <div style={{ fontSize: 8, letterSpacing: 6, fontWeight: 700, color: GOLDPAL }}>G U E S T</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: 248, height: 320, background: '#E8E0C8', border: `4px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 12, color: INKLT }}>No Photo</div>
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT }}>GUEST NAME</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{name}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT }}>SEAT NUMBER</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{seat}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT }}>UNIQUE CODE</div>
                  <div style={{ background: GREEN, border: `1px solid ${GOLD}`, padding: '6px 14px', display: 'flex', alignSelf: 'flex-start' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: GOLDPAL, letterSpacing: 2 }}>{ucode}</div>
                  </div>
                </div>

                {/* QR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  <div style={{ background: GREEN, padding: 4, display: 'flex', alignSelf: 'flex-start' }}>
                    <div style={{ border: `2px solid ${GOLD}`, display: 'flex', background: '#F5F0E0' }}>
                      <img src={qrDataUrl} width={130} height={130} style={{ display: 'block' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 8, letterSpacing: 4, fontWeight: 700, color: INKLT }}>SCAN TO VERIFY</div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ flex: 1, height: 1, background: GOLD }} />
                <div style={{ width: 6, height: 6, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
                <div style={{ flex: 1, height: 1, background: GOLD }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, fontWeight: 700, color: GOLDLT }}>DRESS CODE</div>
                <div style={{ fontSize: 15, color: INK }}>Black Tie / Formal Attire</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ flex: 1, height: 1, background: GOLD }} />
                <div style={{ width: 6, height: 6, background: GOLD, transform: 'rotate(45deg)', display: 'flex' }} />
                <div style={{ flex: 1, height: 1, background: GOLD }} />
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: INKLT, letterSpacing: 1 }}>{tag}</div>
              <div style={{ fontSize: 10, color: INKLT, fontStyle: 'italic', marginTop: 2 }}>
                Please present this card at the entrance for admission
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: fonts.length > 0 ? fonts : undefined,
      }
    );
  } catch (err) {
    console.error('/api/generate-card error:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}