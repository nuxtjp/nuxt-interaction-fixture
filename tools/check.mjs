import {spawn} from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const phase=process.argv[2]
if(!['build','browser'].includes(phase))throw new Error('check/phase/invalid')
const env={...process.env,NUXT_TELEMETRY_DISABLED:'1'}
delete env.NO_COLOR;delete env.FORCE_COLOR
const start=Date.now(), chunks=[]
const child=spawn(phase==='build'?'pnpm':'xvfb-run',phase==='build'?['exec','nuxt','build']
  :['-a','--server-args=-screen 0 1280x1024x24','pnpm','exec','playwright','test'],{cwd:root,env,stdio:['ignore','pipe','pipe']})
child.stdout.on('data',b=>chunks.push(b));child.stderr.on('data',b=>chunks.push(b))
const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve)})
const output=Buffer.concat(chunks).toString()
const warnings=output.split('\n').filter(line=>/\bwarn(?:ing)?\b/iu.test(line))
await fs.mkdir(path.join(root,'.results'),{recursive:true})
await fs.writeFile(path.join(root,'.results',phase+'.log'),output)
const report={phase,exit_code:code,warnings,elapsed_ms:Date.now()-start,status:code===0&&!warnings.length?'passed':'failed'}
await fs.writeFile(path.join(root,'.results',phase+'.json'),JSON.stringify(report,null,2)+'\n')
process.stdout.write(JSON.stringify(report,null,2)+'\n')
if(report.status!=='passed'){process.stderr.write(output.slice(-8000));process.exitCode=1}
