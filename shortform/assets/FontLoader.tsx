/** 폰트 로딩. 컴포지션 최상단에 한 번 넣는다.
 *
 *  delayRender 로 폰트가 실제로 준비될 때까지 렌더를 붙잡는다. 이걸 빼면 첫 프레임 몇 장이
 *  대체 폰트로 인코딩된다(렌더가 끝난 뒤에야 발견되는 종류의 사고다).
 *
 *  ttf 는 각 프로젝트의 public/fonts/ 에 있어야 한다.
 */
import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

export interface FontSpec {
  family: string;
  /** public/ 기준 상대 경로 */
  file: string;
  weight?: string;
  style?: string;
}

export const DEFAULT_FONTS: FontSpec[] = [
  { family: 'NanumSquareRound', file: 'fonts/NanumSquareRoundB.ttf', weight: '700' },
  { family: 'NanumSquareRound', file: 'fonts/NanumSquareRoundR.ttf', weight: '400' },
];

export const FontLoader: React.FC<{ fonts?: FontSpec[] }> = ({ fonts = DEFAULT_FONTS }) => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = fonts.map((f) =>
      new FontFace(f.family, `url(${staticFile(f.file)}) format('truetype')`, {
        weight: f.weight ?? '400',
        style: f.style ?? 'normal',
      })
    );
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle, fonts]);
  return null;
};

export default FontLoader;
