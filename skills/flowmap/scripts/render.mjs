#!/usr/bin/env node
// graph.json 과 고정 템플릿을 합쳐 단일 HTML 파일을 만든다. 외부 의존성 없음.
// 사용법: node render.mjs <graph.json> [출력.html]
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const graphPath = path.resolve(process.argv[2] || 'flowmap.graph.json')

if (!fs.existsSync(graphPath)) {
  console.error(`graph.json 을 찾지 못했습니다: ${graphPath}`)
  process.exit(1)
}

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'))
const outPath = path.resolve(
  process.argv[3] || path.join(graph.project?.root || path.dirname(graphPath), 'flowmap.html')
)

const template = fs.readFileSync(path.join(here, '..', 'templates', 'viewer.html'), 'utf8')

// 인라인 스크립트 안에 </script> 나 주석 종료 시퀀스가 들어가면 문서가 깨진다
const json = JSON.stringify(graph)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029')

const html = template
  .replace('__TITLE__', String(graph.project?.name || 'project').replace(/[<>]/g, ''))
  .replace('__DATA__', json)

fs.writeFileSync(outPath, html)

const kb = (fs.statSync(outPath).size / 1024).toFixed(0)
console.log(JSON.stringify({ out: outPath, sizeKB: Number(kb) }, null, 2))
