/** 자산 카탈로그. 라이브러리의 모든 컴포넌트를 한 화면에 늘어놓고 눈으로 확인한다.
 *  본편에는 들어가지 않는다. 자산을 추가하면 여기에도 한 칸 추가할 것 (REGISTRY 규칙 5번).
 */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import {
  Actor, Appear, BoneStack, BustActor, C, Caption, CardGrid, ChoiceList, CompareBars,
  CountUp, CountdownRing, Character, FONT, FontLoader, Giraffe, HeadNerveDiagram, HumanNeckIcon,
  ICON_NAMES, IceCream, Intro, Label, LabBg, MiniCharacter, Mouse, NightSkyBg, OceanBg, Outro,
  POSES, PlainBg, PulseRing, QMark, Ruler, SW, SavannaBg, Sloth, Sparkles, SpeechBubble,
  SpotlightCircle, StepCounter, ThemedIcon, Whale, blendPose,
} from '../assets';

export const CAT_W = 2560;
export const CAT_H = 4460;

const Section: React.FC<{ x?: number; y: number; title: string; note?: string; children?: React.ReactNode }> = ({
  x = 60, y, title, note, children,
}) => (
  <>
    <div
      style={{
        position: 'absolute', left: x, top: y,
        fontFamily: FONT, fontWeight: 700, fontSize: 42, color: C.ink,
        borderBottom: `6px solid ${C.coral}`, paddingBottom: 6,
      }}
    >
      {title}
      {note ? <span style={{ fontSize: 26, color: C.inkSoft, marginLeft: 18 }}>{note}</span> : null}
    </div>
    {children}
  </>
);

const Cell: React.FC<{ x: number; y: number; w: number; h: number; label: string; children: React.ReactNode }> = ({
  x, y, w, h, label, children,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w }}>
    <div
      style={{
        width: w, height: h, border: `3px solid ${C.hill}`, borderRadius: 16,
        position: 'relative', overflow: 'hidden', background: C.paper,
      }}
    >
      {children}
    </div>
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: C.ink, marginTop: 6 }}>
      {label}
    </div>
  </div>
);

/** 1080x1920 배경을 축소해서 미리보기 */
const BgThumb: React.FC<{ x: number; y: number; scale: number; label: string; children: React.ReactNode }> = ({
  x, y, scale, label, children,
}) => (
  <Cell x={x} y={y} w={1080 * scale} h={1920 * scale} label={label}>
    <div
      style={{
        position: 'absolute', left: 0, top: 0, width: 1080, height: 1920,
        transform: `scale(${scale})`, transformOrigin: '0 0',
      }}
    >
      {children}
    </div>
  </Cell>
);

const DEMO_CAPTION = {
  words: [
    { w: '이건', s: 0, e: 0.4 },
    { w: '자막', s: 0.4, e: 0.9 },
    { w: '스타일', s: 0.9, e: 1.5 },
    { w: '예시야', s: 1.5, e: 2.2 },
  ],
  start: 0,
  end: 4,
};

const POSE_NAMES = Object.keys(POSES) as (keyof typeof POSES)[];
const ICON_DEMO = [
  'bone', 'heart', 'brain', 'dna', 'lungs', 'eye', 'flask', 'microscope',
  'atom', 'magnet', 'thermometer', 'bulb', 'planet', 'rocket', 'moon', 'star',
  'world', 'telescope', 'question-mark', 'search', 'check', 'arrow-right',
  'clock', 'trophy', 'bell', 'leaf', 'droplet', 'flame', 'snowflake', 'fish',
];

export const Catalog: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#FBFCFD' }}>
      <FontLoader />

      <div
        style={{
          position: 'absolute', left: 60, top: 40,
          fontFamily: FONT, fontWeight: 700, fontSize: 64, color: C.ink,
        }}
      >
        숏폼 자산 라이브러리 카탈로그
        <span style={{ fontSize: 28, color: C.inkSoft, marginLeft: 20 }}>
          assets/REGISTRY.md 참조
        </span>
      </div>

      {/* ============ 1. 색 토큰 ============ */}
      <Section y={150} title="1. 색 토큰" note="theme.ts">
        {Object.entries(C).map(([k, v], i) => (
          <div key={k} style={{ position: 'absolute', left: 60 + i * 122, top: 220 }}>
            <div
              style={{
                width: 112, height: 84, background: v, borderRadius: 12,
                border: `3px solid ${C.hill}`,
              }}
            />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, color: C.ink, marginTop: 4 }}>
              {k}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 15, color: C.inkSoft }}>{v}</div>
          </div>
        ))}
      </Section>

      {/* ============ 2. 캐릭터 포즈 ============ */}
      <Section y={400} title="2. 캐릭터 포즈" note="assets/character/poses.ts - 모든 프로필 공용 마스코트">
        {POSE_NAMES.map((name, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          return (
            <Cell
              key={name}
              x={60 + col * 312}
              y={470 + row * 330}
              w={300}
              h={280}
              label={name}
            >
              <Character {...POSES[name]} width={278} style={{ marginLeft: 11 }} />
            </Cell>
          );
        })}
        <Cell x={60 + 7 * 312} y={470 + 330} w={300} h={280} label="BustActor touchForehead / 실루엣">
          <BustActor size={150} left={8} top={0} pose={POSES.touchForehead} mouthOpen={0.6} />
          <Character
            {...POSES.cheer} width={150} color={C.nightSoft} accent={C.nightSoft} fill={C.nightSoft}
            style={{ position: 'absolute', left: 150, top: 20 }}
          />
        </Cell>
      </Section>

      {/* ============ 3. 소품 ============ */}
      <Section y={1220} title="3. 소품 (직접 그린 것)" note="assets/props/">
        <Cell x={60} y={1290} w={245} h={330} label="Giraffe drink=0">
          <Giraffe width={160} style={{ marginLeft: 40, marginTop: 6 }} />
        </Cell>
        <Cell x={325} y={1290} w={245} h={330} label="Giraffe drink=1">
          <Giraffe width={160} drink={1} style={{ marginLeft: 40, marginTop: 6 }} />
        </Cell>
        <Cell x={590} y={1290} w={245} h={330} label="Mouse">
          <Mouse width={205} style={{ marginLeft: 18, marginTop: 110 }} />
        </Cell>
        <Cell x={855} y={1290} w={245} h={330} label="Whale">
          <Whale width={220} style={{ marginLeft: 10, marginTop: 90 }} />
        </Cell>
        <Cell x={1120} y={1290} w={245} h={330} label="Sloth (silhouette)">
          <Sloth width={205} silhouette={C.nightSoft} style={{ marginLeft: 18, marginTop: 40 }} />
        </Cell>
        <Cell x={1385} y={1290} w={245} h={330} label="BoneStack lit=4/7">
          <div style={{ position: 'absolute', left: 70, top: 20 }}>
            <BoneStack count={7} lit={4} blockW={80} blockH={22} gap={6} />
          </div>
        </Cell>
        <Cell x={1650} y={1290} w={245} h={330} label="HumanNeckIcon / QMark">
          <HumanNeckIcon width={110} style={{ marginLeft: 15, marginTop: 40 }} />
          <QMark size={110} style={{ left: 140, top: 70 }} />
        </Cell>
        <Cell x={1915} y={1290} w={245} h={330} label="IceCream">
          <IceCream width={150} style={{ marginLeft: 45, marginTop: 10 }} />
        </Cell>
        <Cell x={2180} y={1290} w={245} h={330} label="HeadNerveDiagram (mouth+forehead+nerve)">
          <HeadNerveDiagram
            f={f} width={190} x={20} y={10}
            highlightMouth highlightForehead showNerve={1} signalT={(f % 60) / 60}
          />
        </Cell>
      </Section>

      <Cell x={60} y={1690} w={1080} h={210} label="Ruler (max=30, pxPerUnit=30, markAt=25)">
        <Ruler max={30} pxPerUnit={30} originX={70} top={40} height={80} markAt={25} svgHeight={200} />
      </Cell>

      {/* ============ 4. 외부 아이콘 ============ */}
      <Section
        y={1960}
        title="4. 외부 아이콘 (Tabler, MIT)"
        note={`ThemedIcon - 로컬 캐시 ${ICON_NAMES.length}종, 렌더 시 네트워크 안 씀`}
      >
        {ICON_DEMO.map((name, i) => {
          const col = i % 15;
          const row = Math.floor(i / 15);
          return (
            <div key={name} style={{ position: 'absolute', left: 60 + col * 166, top: 2030 + row * 150 }}>
              <div
                style={{
                  width: 150, height: 108, border: `3px solid ${C.hill}`, borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.paper,
                }}
              >
                <ThemedIcon name={name} size={76} />
              </div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: C.inkSoft, marginTop: 3 }}>{name}</div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 60, top: 2330, display: 'flex', gap: 24, alignItems: 'center' }}>
          <ThemedIcon name="bone" size={90} color={C.coral} />
          <ThemedIcon name="star" size={90} color={C.gold} />
          <ThemedIcon name="bulb" size={90} bg={C.goldSoft} />
          <ThemedIcon name="rocket" size={90} color={C.cream} bg={C.night} />
          <ThemedIcon name="heart" size={140} color={C.coral} />
          <div style={{ fontFamily: FONT, fontSize: 24, color: C.inkSoft, maxWidth: 520 }}>
            색·크기·배경원을 props 로 바꾼다. 선 굵기는 화면상 절대 두께(기본 SW=13px)로
            자동 보정돼 캐릭터 선과 어울린다.
          </div>
        </div>
      </Section>

      {/* ============ 5. 씬 컴포넌트 ============ */}
      <Section y={2520} title="5. 씬 컴포넌트 (내용 무관 연출)" note="assets/scenes/">
        {/* CardGrid */}
        <Cell x={60} y={2590} w={800} h={800} label="CardGrid (2열) + Card badge">
          <div style={{ position: 'absolute', left: 0, top: 0, width: 800, height: 800 }}>
            <CardGrid
              x={30}
              y={20}
              size={355}
              gap={26}
              columns={2}
              frame={f}
              appearAt={(i) => i * 6}
              items={[
                { label: '쥐', badge: 7, art: <Mouse width={250} /> },
                { label: '고래', badge: 7, art: <Whale width={260} /> },
                { label: '사람', badge: 7, art: <MiniCharacter width={200} /> },
                { label: '기린', badge: 7, art: <Giraffe width={160} /> },
              ]}
            />
          </div>
        </Cell>

        {/* ChoiceList */}
        <Cell x={890} y={2590} w={800} h={390} label="ChoiceList (정답 공개 포함)">
          <ChoiceList
            x={20}
            y={20}
            width={740}
            rowHeight={100}
            rowGap={16}
            textSize={48}
            frame={f}
            appearAt={(i) => i * 5}
            correct={0}
            revealAt={40}
            items={[
              { badge: 1, text: '일곱 개' },
              { badge: 2, text: '스무 개' },
              { badge: 3, text: '백 개' },
            ]}
          />
        </Cell>

        {/* CompareBars */}
        <Cell x={890} y={3020} w={800} h={370} label="CompareBars + Ruler 같은 스케일">
          <CompareBars
            x={30}
            y={20}
            pxPerUnit={24}
            rowGap={120}
            frame={f}
            items={[
              { label: '사람 목뼈', value: 2.1, color: C.coral, at: 0, valueText: '2cm' },
              { label: '기린 목뼈', value: 25, color: C.gold, at: 8, thickness: 60 },
            ]}
          />
          <div style={{ position: 'absolute', left: 0, top: 250 }}>
            <Ruler max={30} pxPerUnit={24} originX={30} top={10} height={60} markAt={25} svgHeight={120} />
          </div>
        </Cell>

        {/* SpeechBubble round */}
        <Cell x={1720} y={2590} w={400} h={390} label="SpeechBubble round">
          <div style={{ position: 'absolute', left: 0, top: 0, width: 400, height: 390 }}>
            <SpeechBubble x={210} y={175} r={150} shape="round" tail="bottomLeft">
              <BoneStack count={7} lit={7} blockW={70} blockH={22} gap={6} />
            </SpeechBubble>
          </div>
        </Cell>

        {/* SpeechBubble rect */}
        <Cell x={2150} y={2590} w={400} h={390} label="SpeechBubble rect + CountdownRing">
          <SpeechBubble x={20} y={40} w={360} h={150} shape="rect" tail="bottomRight" text="이건 말풍선!" textSize={44} />
          <CountdownRing x={100} y={220} size={150} at={0} duration={90} frame={f} />
        </Cell>

        {/* Counter + effects */}
        <Cell x={1720} y={3020} w={400} h={370} label="StepCounter / CountUp">
          <StepCounter x={200} y={40} steps={[0, 6, 12, 18, 24, 30, 36]} frame={f} size={120} />
          <CountUp
            x={200} y={210} width={380} to={1250} at={0} duration={45} frame={f}
            size={72} color={C.ink} suffix="개"
          />
        </Cell>

        {/* Sparkles / Appear / Spotlight */}
        <Cell x={2150} y={3020} w={400} h={370} label="Sparkles / PulseRing / SpotlightCircle">
          <PulseRing x={30} y={40} size={190} frame={f} color={C.coralSoft} />
          <div style={{ position: 'absolute', left: 0, top: 0 }}>
            <Sparkles box={{ x: 20, y: 20, w: 360, h: 250 }} t={0.5} />
          </div>
          <SpotlightCircle x={205} y={80} size={170}>
            <div style={{ position: 'relative', width: 170, height: 170 }}>
              <BustActor size={200} left={-15} top={4} pose={POSES.waveBye} />
            </div>
          </SpotlightCircle>
          <Appear progress={1} from="up">
            <Label x={200} y={300} text="Appear 래퍼로 감싼 텍스트" size={26} color={C.inkSoft} />
          </Appear>
        </Cell>

        {/* Caption */}
        <Cell x={60} y={3430} w={800} h={220} label="Caption (밝은 배경)">
          <div style={{ position: 'relative', width: 800, height: 220 }}>
            <Caption line={DEMO_CAPTION} t={1.1} side={20} bottom={40} maxWidth={740} fontSize={52} />
          </div>
        </Cell>
        <Cell x={890} y={3430} w={800} h={220} label="Caption (어두운 배경 dark)">
          <div style={{ position: 'relative', width: 800, height: 220, background: C.night }}>
            <Caption
              line={DEMO_CAPTION}
              t={1.1}
              dark
              side={20}
              bottom={40}
              maxWidth={740}
              fontSize={52}
              emphasis={/자막/}
            />
          </div>
        </Cell>
        <Cell x={1720} y={3430} w={830} h={220} label="Actor 배치 (바닥선 정렬) / blendPose">
          <div style={{ position: 'relative', width: 830, height: 220 }}>
            <Actor size={240} centerX={130} ground={210} pose={POSES.idle} />
            <Actor size={240} centerX={330} ground={210} pose={blendPose(POSES.idle, POSES.cheer, 0.5)} />
            <Actor size={240} centerX={530} ground={210} pose={POSES.crouch} />
            <Actor size={240} centerX={720} ground={210} pose={POSES.thinking} />
          </div>
        </Cell>
      </Section>

      {/* ============ 6. 배경 ============ */}
      <Section y={3720} title="6. 배경" note="assets/backgrounds/ - 캐릭터가 묻히지 않게 전부 연한 톤">
        <BgThumb x={60} y={3790} scale={0.28} label="PlainBg (기본형)">
          <PlainBg />
        </BgThumb>
        <BgThumb x={400} y={3790} scale={0.28} label="SavannaBg (pond=1)">
          <SavannaBg pan={40} pond={1} />
        </BgThumb>
        <BgThumb x={740} y={3790} scale={0.28} label="NightSkyBg (우주·밤하늘)">
          <NightSkyBg frame={f} horizon={1450} />
        </BgThumb>
        <BgThumb x={1080} y={3790} scale={0.28} label="LabBg (실내·실험실)">
          <LabBg />
        </BgThumb>
        <BgThumb x={1420} y={3790} scale={0.28} label="OceanBg (바다)">
          <OceanBg frame={f} />
        </BgThumb>
        {/* 브랜드 구간은 시간축이 있으므로 Sequence 로 프레임을 옮겨 중간 상태를 보여준다 */}
        <BgThumb x={1780} y={3790} scale={0.28} label="brand/Intro (2.3초, f=30)">
          <Sequence from={30} layout="none"><Intro /></Sequence>
        </BgThumb>
        <BgThumb x={2120} y={3790} scale={0.28} label="brand/Outro (3.0초, f=40)">
          <Sequence from={20} layout="none"><Outro nextHint="다음 편엔 이 친구!" /></Sequence>
        </BgThumb>
      </Section>

      <div
        style={{
          position: 'absolute', left: 60, top: CAT_H - 46,
          fontFamily: FONT, fontSize: 24, color: C.inkSoft,
        }}
      >
        {`선 굵기 SW=${SW} / 잉크 ${C.ink} / 코랄 ${C.coral} - 새 자산 추가 규칙은 assets/REGISTRY.md`}
      </div>
    </AbsoluteFill>
  );
};

export default Catalog;
