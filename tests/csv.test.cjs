// Synthetic fixtures only. Run: node tests/csv.test.cjs
const fs=require("node:fs"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
const script=html.match(/<script>\n([^]*)<\/script>/)[1];
const elements=new Map();
const document={
  getElementById(id){if(!elements.has(id))elements.set(id,{textContent:"",innerHTML:"",style:{},value:"",addEventListener(){},click(){},classList:{remove(){},add(){}}});return elements.get(id);},
  querySelectorAll(){return [];},querySelector(){return {addEventListener(){}};}
};
function Chart(){this.destroy=()=>{};}
const api=new Function("document","Chart","localStorage","window","location",script+";return {ingestCSV,DATA,GSC,render,readGSC,parseCSV,gscTotal};")(document,Chart,{getItem(){return null;}},{},{});
assert.equal(api.parseCSV('\uFEFF"a,b","c""d"\r\n"multi\nline",3')[1][0],"multi\nline");
assert.equal(api.parseCSV('# report\nPage path,Views\n/a,100').length,2);
let report=api.readGSC('検索クエリ,クリック数,表示回数,CTR,掲載順位\n"薬,点滴",10,"1,000",1%,4.2\n"薬,点滴",10,"1,000",1%,4.2');
assert.equal(report.rows.length,1);assert.equal(api.gscTotal(report).clicks,10);
report=api.readGSC('Date,Clicks,Impressions,CTR,Position\n2026-10-01,10,100,10%,2\n2026-10-02,0,300,0%,6');
assert.equal(api.gscTotal(report).position,5);assert.equal(api.gscTotal(report).ctr,2.5);
assert.throws(()=>api.readGSC('Pages,Clicks,Impressions,CTR,Position\n/a,,100,0%,4'));
assert.throws(()=>api.readGSC('Pages,Clicks,Impressions,CTR,Position\n/a,1,10,10%,4\n/a,2,10,20%,4'));
assert.throws(()=>api.parseCSV('"unclosed'));
assert.equal(api.readGSC('Filter,Value\nSearch type,Web').type,"filters");
assert.equal(api.readGSC('Page path,Views\n/a,100'),null);
const before=JSON.stringify(api.DATA);
assert.match(api.ingestCSV('Pages,Clicks,Impressions,CTR,Position\n/a,1,10,10%,4'),/専用/);
assert.equal(JSON.stringify(api.DATA),before);
assert.match(api.ingestCSV('# GA4\nPage path,Views\n/contact,123\n/a,300'),/反映/);
assert.match(api.ingestCSV('Device category,Sessions\nmobile,50\ndesktop,50'),/反映/);
assert.match(api.ingestCSV('Session default channel group,Sessions\nOrganic Search,100\nDirect,10'),/反映/);
for(const site of ["corp","recruit","vision"])api.render(site);
assert.match(html,/href="favicon.png"/);assert.match(html,/src="logo.png"/);
assert.match(html,/@media\(max-width:600px\)/);
console.log("CSV and dashboard regression checks passed (DOM and Chart stubs; visual QA is separate).");
