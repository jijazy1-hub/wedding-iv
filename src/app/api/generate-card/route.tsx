import { ImageResponse } from 'next/og';
import { findGuestByUniqueCode } from '@/lib/airtable';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

// Fetch a Google Font in TTF format (old UA forces TTF response)
async function getFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}`,
      { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)' } }
    )
  ).text();
  const url = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`Font not found: ${family} ${weight}`);
  return (await fetch(url)).arrayBuffer();
}

function safe(s: string): string {
  return (s ?? '').replace(/[^\x20-\x7E]/g, '').trim();
}

export async function POST(req: Request) {
  try {
    const body        = await req.json();
    const code        = String(body.code ?? '').trim();
    const imageBase64 = body.imageBase64 as string | null;

    if (!code) return Response.json({ error: 'Code required' }, { status: 400 });

    const guest = await findGuestByUniqueCode(code);
    if (!guest) return Response.json({ error: 'Guest not found' }, { status: 404 });

    const [qrDataUrl, fontScript, fontBold, fontRegular] = await Promise.all([
      QRCode.toDataURL(code, {
        margin: 2, width: 220,
        color: { dark: '#0B2A12', light: '#F5F0E0' },
      }),
      getFont('Great Vibes', 400),
      getFont('Cormorant Garamond', 700),
      getFont('Cormorant Garamond', 400),
    ]);

    const title = safe(process.env.NEXT_PUBLIC_WEDDING_TITLE  ?? 'Gabby & Esther');
    const date  = safe(process.env.NEXT_PUBLIC_WEDDING_DATE   ?? 'Saturday, 14th December 2024');
    const venue = safe(process.env.NEXT_PUBLIC_WEDDING_VENUE  ?? 'The Grand Ballroom, Eko Hotel & Suites');
    const time  = safe(process.env.NEXT_PUBLIC_WEDDING_TIME   ?? '12:00 PM');
    const name  = safe(guest.Name);
    const seat  = safe(String(guest.Seat_Number ?? 'TBA'));
    const ucode = safe(guest.Unique_Code ?? code);
    const tag   = '#' + safe(title.replace(/\s*&\s*/g, 'And').replace(/\s/g, '')) + '2024';

    // ── Shared style tokens ──────────────────────────────────────
    const BG      = '#F8F4E3';
    const GREEN   = '#0A2810';
    const GOLD    = '#B8860B';
    const GOLDLT  = '#D4A843';
    const GOLDPAL = '#F0DFA0';
    const INK     = '#1A1208';
    const INKLT   = '#4A3D2A';

    const W = 800, H = 1150;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: W,
            height: H,
            background: BG,
            fontFamily: '"Cormorant Garamond"',
            position: 'relative',
          }}
        >
          {/* ── Outer dark-green border ── */}
          <div style={{ position: 'absolute', inset: 10, border: `3px solid ${GREEN}`, display: 'flex' }} />
          {/* ── Inner gold hairline ── */}
          <div style={{ position: 'absolute', inset: 20, border: `1px solid ${GOLD}`, display: 'flex' }} />
          {/* ── Corner diamonds ── */}
          {[{ t: 13, l: 13 }, { t: 13, r: 13 }, { b: 13, l: 13 }, { b: 13, r: 13 }].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 10, height: 10,
              background: GOLD, transform: 'rotate(45deg)',
              ...pos,
            }} />
          ))}

          {/* ── All content ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            width: '100%', padding: '36px 44px 28px',
            gap: 0,
          }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                fontSize: 10, letterSpacing: 8, color: GOLDLT,
                fontFamily: '"Cormorant Garamond"', fontWeight: 700,
              }}>
                WEDDING  INVITATION
              </div>

              {/* Couple names in script */}
              <div style={{
                fontSize: 76, color: '#7A5C00',
                fontFamily: '"Great Vibes"', lineHeight: 1.1, marginTop: 2,
              }}>
                {title}
              </div>

              {/* Gold rule */}
              <div style={{ width: 480, height: 1, background: GOLD, marginTop: 4 }} />

              <div style={{
                fontSize: 14, color: INKLT, fontStyle: 'italic',
                fontFamily: '"Cormorant Garamond"', fontWeight: 400, marginTop: 6,
              }}>
                Together with their families, request the pleasure of your company
              </div>
            </div>

            {/* ── EVENT BAR ── */}
            <div style={{
              display: 'flex', marginTop: 20,
              border: `1px solid ${GOLD}`,
              background: '#F0E8C8',
            }}>
              {[
                { label: 'DATE', value: date },
                { label: 'TIME', value: time },
                { label: 'VENUE', value: venue },
              ].map((col, i) => (
                <div key={i} style={{ display: 'flex', flex: 1, position: 'relative' }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', left: 0, top: 10, bottom: 10,
                      width: 1, background: GOLDLT,
                    }} />
                  )}
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '16px 12px', width: '100%', gap: 6,
                  }}>
                    <div style={{
                      fontSize: 9, letterSpacing: 5, fontWeight: 700,
                      color: GOLDLT, fontFamily: '"Cormorant Garamond"',
                    }}>
                      {col.label}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: INK,
                      textAlign: 'center', fontFamily: '"Cormorant Garamond"',
                    }}>
                      {col.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── RSVP label ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginTop: 18,
            }}>
              <div style={{ flex: 1, height: 1, background: GOLD }} />
              <div style={{
                fontSize: 11, letterSpacing: 7, fontWeight: 700, color: GOLDLT,
                fontFamily: '"Cormorant Garamond"',
              }}>
                RSVP ADMISSION CARD
              </div>
              <div style={{ flex: 1, height: 1, background: GOLD }} />
            </div>

            {/* ── MAIN BODY ── */}
            <div style={{ display: 'flex', gap: 28, marginTop: 20, flex: 1 }}>

              {/* Left: photo */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                {imageBase64 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Layered frame: dark shadow > gold > white mat > photo */}
                    <div style={{ background: GREEN, padding: 6, display: 'flex' }}>
                      <div style={{ border: `2px solid ${GOLD}`, padding: 3, display: 'flex', background: 'white' }}>
                        <img
                          src={imageBase64}
                          width={230}
                          height={280}
                          style={{ objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    </div>
                    {/* "GUEST" label badge */}
                    <div style={{
                      background: GREEN, display: 'flex',
                      justifyContent: 'center', paddingTop: 6, paddingBottom: 6,
                    }}>
                      <div style={{
                        fontSize: 8, letterSpacing: 6, fontWeight: 700,
                        color: GOLDPAL, fontFamily: '"Cormorant Garamond"',
                      }}>
                        G U E S T
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: 248, height: 320, background: '#E8E0C8',
                    border: `4px solid ${GREEN}`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: 12, color: INKLT }}>No Photo</div>
                  </div>
                )}
              </div>

              {/* Right: details */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>

                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT }}>GUEST NAME</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{name}</div>
                </div>

                {/* Seat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT }}>SEAT NUMBER</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{seat}</div>
                </div>

                {/* Code badge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, fontWeight: 700, color: GOLDLT }}>UNIQUE CODE</div>
                  <div style={{
                    background: GREEN, border: `1px solid ${GOLD}`,
                    padding: '6px 14px', display: 'flex', alignSelf: 'flex-start',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: GOLDPAL, letterSpacing: 2 }}>
                      {ucode}
                    </div>
                  </div>
                </div>

                {/* QR code */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  <div style={{ background: GREEN, padding: 4, display: 'flex', alignSelf: 'flex-start' }}>
                    <div style={{ border: `2px solid ${GOLD}`, display: 'flex', background: '#F5F0E0' }}>
                      <img src={qrDataUrl} width={130} height={130} style={{ display: 'block' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 8, letterSpacing: 4, fontWeight: 700, color: INKLT }}>
                    SCAN TO VERIFY
                  </div>
                </div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              marginTop: 20, gap: 10,
            }}>
              {/* Gold separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ flex: 1, height: 1, background: GOLD }} />
                <div style={{
                  width: 6, height: 6, background: GOLD,
                  transform: 'rotate(45deg)',
                }} />
                <div style={{ flex: 1, height: 1, background: GOLD }} />
              </div>

              {/* Dress code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, fontWeight: 700, color: GOLDLT }}>DRESS CODE</div>
                <div style={{ fontSize: 15, color: INK, fontWeight: 400 }}>Black Tie / Formal Attire</div>
              </div>

              {/* Bottom separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{ flex: 1, height: 1, background: GOLD }} />
                <div style={{
                  width: 6, height: 6, background: GOLD,
                  transform: 'rotate(45deg)',
                }} />
                <div style={{ flex: 1, height: 1, background: GOLD }} />
              </div>

              {/* Hashtag */}
              <div style={{ fontSize: 13, fontWeight: 700, color: INKLT, letterSpacing: 1 }}>{tag}</div>

              {/* Footer note */}
              <div style={{
                fontSize: 10, color: INKLT, fontStyle: 'italic', marginTop: 2,
              }}>
                Please present this card at the entrance for admission
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: [
          { name: 'Great Vibes',         data: fontScript,  weight: 400, style: 'normal' },
          { name: 'Cormorant Garamond',  data: fontBold,    weight: 700, style: 'normal' },
          { name: 'Cormorant Garamond',  data: fontRegular, weight: 400, style: 'normal' },
        ],
      }
    );
  } catch (err) {
    console.error('/api/generate-card error:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
