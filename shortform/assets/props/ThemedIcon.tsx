/** Tabler Icons(MIT) 를 우리 스타일로 입혀 쓰는 래퍼.
 *
 *  왜 로컬 캐시인가
 *    @iconify/react 의 기본 동작은 렌더 시점에 iconify API 를 네트워크로 조회하는 것이다.
 *    Remotion 렌더는 프레임 수만큼 브라우저를 돌리는 배치 작업이라, 조회가 한 번이라도
 *    늦거나 실패하면 그 프레임만 아이콘이 빠진 채로 인코딩된다(= 렌더 다 끝난 뒤에야 발견).
 *    그래서 렌더 경로에서는 네트워크를 완전히 배제하고 tabler-cache.json 만 읽는다.
 *    아이콘을 추가하려면 scripts/sync_icons.mjs 로 캐시를 다시 만든다 (npm run sync-icons).
 *
 *  왜 stroke-width 를 다시 쓰는가
 *    Tabler 의 아이콘 body 에는 stroke-width="2" 가 요소 속성으로 박혀 있어서
 *    부모 svg 에 값을 줘도 상속으로는 못 덮는다. 문자열 치환으로 직접 바꾼다.
 *
 *  선 굵기 규약
 *    캐릭터·소품과 같은 "화면상 절대 두께"(기본 SW = 13px)를 유지한다.
 *    아이콘을 크게 그리면 stroke-width 숫자는 작아지고, 작게 그리면 커진다.
 *
 *  사용 예
 *    <ThemedIcon name="bone" size={120} />
 *    <ThemedIcon name="tabler:heart" size={90} color={C.coral} />
 */
import React from 'react';
import { C, SW } from '../theme';
import cache from './tabler-cache.json';

interface CacheEntry { body: string; w: number; h: number }
const ICONS = (cache as { icons: Record<string, CacheEntry> }).icons;

/** 캐시에 들어 있는 아이콘 이름 목록 (카탈로그·검수용) */
export const ICON_NAMES = Object.keys(ICONS).sort();

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export interface ThemedIconProps {
  /** 아이콘 이름. 'bone' 또는 'tabler:bone' 둘 다 받는다 */
  name: string;
  /** 화면상 한 변 크기(px) */
  size: number;
  /** 선 색 (기본 ink) */
  color?: string;
  /** 화면상 선 두께(px). 기본은 테마의 SW 라 캐릭터와 굵기가 맞는다 */
  strokePx?: number;
  /** 배경 원을 깔지 여부. 어두운 배경에서 아이콘이 묻힐 때 쓴다 */
  bg?: string;
  /** bg 를 쓸 때 원의 여백 비율 (0.2 = 아이콘 크기의 20%) */
  bgPad?: number;
  style?: React.CSSProperties;
}

export const ThemedIcon: React.FC<ThemedIconProps> = ({
  name, size, color = C.ink, strokePx = SW, bg, bgPad = 0.24, style,
}) => {
  const key = name.replace(/^tabler:/, '');
  const icon = ICONS[key];

  // 캐시에 없으면 조용히 빈 자리로 두지 않고 눈에 띄게 표시한다.
  // 렌더가 다 끝난 뒤 "아이콘이 없었네"를 발견하는 것이 가장 비싸기 때문이다.
  if (!icon) {
    return (
      <div
        style={{
          width: size, height: size, boxSizing: 'border-box',
          border: `3px dashed ${C.coral}`, color: C.coral,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.max(10, size * 0.12), textAlign: 'center', wordBreak: 'break-all',
          ...style,
        }}
      >
        {`icon?\n${key}`}
      </div>
    );
  }

  const vb = Math.max(icon.w, icon.h);
  const sw = clamp((strokePx * vb) / size, 1.4, 3.6);
  const body = icon.body
    .replace(/stroke-width="[^"]*"/g, `stroke-width="${sw.toFixed(2)}"`)
    .replace(/stroke="currentColor"/g, `stroke="${color}"`)
    .replace(/fill="currentColor"/g, `fill="${color}"`);

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${icon.w} ${icon.h}`}
      width={size}
      height={size}
      shapeRendering="geometricPrecision"
      style={bg ? undefined : style}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );

  if (!bg) return svg;

  const box = size * (1 + bgPad * 2);
  return (
    <div
      style={{
        width: box, height: box, borderRadius: box / 2, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}
    >
      {svg}
    </div>
  );
};

export default ThemedIcon;

/* ---------------- Studio 전용 아이콘 탐색기 ----------------
 * 렌더에는 절대 넣지 말 것. @iconify/react 의 Icon 은 이름을 iconify API 로 조회하므로
 * 캐시에 없는 아이콘도 즉시 볼 수 있다. Remotion Studio 에서 후보를 고를 때만 쓰고,
 * 고른 아이콘은 scripts/icons.txt 에 추가하고 npm run sync-icons 로 캐시에 넣은 뒤
 * ThemedIcon 으로 바꿔 쓴다.
 */
export const IconBrowser: React.FC<{ names: string[]; size?: number }> = ({ names, size = 72 }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, color: C.ink }}>
    {names.map((nm) => (
      <div key={nm} style={{ width: size + 40, textAlign: 'center', fontSize: 12 }}>
        <LazyIconify name={nm.includes(':') ? nm : `tabler:${nm}`} size={size} />
        <div>{nm}</div>
      </div>
    ))}
  </div>
);

const LazyIconify: React.FC<{ name: string; size: number }> = ({ name, size }) => {
  // 렌더 번들에 iconify 런타임이 딸려 들어가지 않도록 지연 로드한다
  const [Cmp, setCmp] = React.useState<React.ComponentType<Record<string, unknown>> | null>(null);
  React.useEffect(() => {
    let alive = true;
    import('@iconify/react')
      .then((m) => alive && setCmp(() => m.Icon as unknown as React.ComponentType<Record<string, unknown>>))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  if (!Cmp) return <div style={{ width: size, height: size }} />;
  return <Cmp icon={name} width={size} height={size} />;
};
