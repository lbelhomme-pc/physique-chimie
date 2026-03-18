// src/components/pedagogie/TableauPeriodique.tsx
// Tableau périodique COMPLET (118 éléments) — popup modale au clic
// Infos : Z, A, neutrons, config électronique, fusion, ébullition, oxydation, abondance, utilisation

import { useState } from "react";

interface El {
  z: number; sym: string; name: string; mass: number;
  cat: string; row: number; col: number;
  config?: string; fusion?: string; ebul?: string;
  oxyd?: string; abond?: string; usage?: string;
}

const D: El[] = [
{z:1,sym:"H",name:"Hydrogène",mass:1,cat:"nm",row:1,col:1,config:"1s¹",fusion:"-259°C",ebul:"-253°C",oxyd:"+1, -1",abond:"1400 mg/kg",usage:"Carburant fusée, piles à combustible"},
{z:2,sym:"He",name:"Hélium",mass:4,cat:"gn",row:1,col:18,config:"1s²",fusion:"-272°C",ebul:"-269°C",oxyd:"0",abond:"0,008 mg/kg",usage:"Ballons, refroidissement IRM"},
{z:3,sym:"Li",name:"Lithium",mass:7,cat:"al",row:2,col:1,config:"[He] 2s¹",fusion:"181°C",ebul:"1342°C",oxyd:"+1",abond:"20 mg/kg",usage:"Batteries, médicaments"},
{z:4,sym:"Be",name:"Béryllium",mass:9,cat:"at",row:2,col:2,config:"[He] 2s²",fusion:"1287°C",ebul:"2469°C",oxyd:"+2",abond:"2,8 mg/kg",usage:"Alliages aérospatiaux"},
{z:5,sym:"B",name:"Bore",mass:11,cat:"ml",row:2,col:13,config:"[He] 2s² 2p¹",fusion:"2076°C",ebul:"3927°C",oxyd:"+3",abond:"10 mg/kg",usage:"Verres résistants (Pyrex)"},
{z:6,sym:"C",name:"Carbone",mass:12,cat:"nm",row:2,col:14,config:"[He] 2s² 2p²",fusion:"3550°C",ebul:"4027°C",oxyd:"+4, -4",abond:"200 mg/kg",usage:"Base de la chimie organique"},
{z:7,sym:"N",name:"Azote",mass:14,cat:"nm",row:2,col:15,config:"[He] 2s² 2p³",fusion:"-210°C",ebul:"-196°C",oxyd:"+5, -3",abond:"19 mg/kg",usage:"Engrais, atmosphère (78%)"},
{z:8,sym:"O",name:"Oxygène",mass:16,cat:"nm",row:2,col:16,config:"[He] 2s² 2p⁴",fusion:"-219°C",ebul:"-183°C",oxyd:"-2",abond:"461000 mg/kg",usage:"Respiration, combustion"},
{z:9,sym:"F",name:"Fluor",mass:19,cat:"ha",row:2,col:17,config:"[He] 2s² 2p⁵",fusion:"-220°C",ebul:"-188°C",oxyd:"-1",abond:"585 mg/kg",usage:"Dentifrice, Téflon"},
{z:10,sym:"Ne",name:"Néon",mass:20,cat:"gn",row:2,col:18,config:"[He] 2s² 2p⁶",fusion:"-249°C",ebul:"-246°C",oxyd:"0",abond:"0,005 mg/kg",usage:"Enseignes lumineuses"},
{z:11,sym:"Na",name:"Sodium",mass:23,cat:"al",row:3,col:1,config:"[Ne] 3s¹",fusion:"98°C",ebul:"883°C",oxyd:"+1",abond:"23600 mg/kg",usage:"Sel de table (NaCl)"},
{z:12,sym:"Mg",name:"Magnésium",mass:24,cat:"at",row:3,col:2,config:"[Ne] 3s²",fusion:"650°C",ebul:"1091°C",oxyd:"+2",abond:"23300 mg/kg",usage:"Alliages légers, feux d'artifice"},
{z:13,sym:"Al",name:"Aluminium",mass:27,cat:"mp",row:3,col:13,config:"[Ne] 3s² 3p¹",fusion:"660°C",ebul:"2519°C",oxyd:"+3",abond:"82300 mg/kg",usage:"Canettes, avions, emballages"},
{z:14,sym:"Si",name:"Silicium",mass:28,cat:"ml",row:3,col:14,config:"[Ne] 3s² 3p²",fusion:"1414°C",ebul:"3265°C",oxyd:"+4, -4",abond:"282000 mg/kg",usage:"Puces électroniques, verre"},
{z:15,sym:"P",name:"Phosphore",mass:31,cat:"nm",row:3,col:15,config:"[Ne] 3s² 3p³",fusion:"44°C",ebul:"281°C",oxyd:"+5, -3",abond:"1050 mg/kg",usage:"Allumettes, engrais"},
{z:16,sym:"S",name:"Soufre",mass:32,cat:"nm",row:3,col:16,config:"[Ne] 3s² 3p⁴",fusion:"115°C",ebul:"445°C",oxyd:"+6, -2",abond:"350 mg/kg",usage:"Acide sulfurique, vulcanisation"},
{z:17,sym:"Cl",name:"Chlore",mass:35,cat:"ha",row:3,col:17,config:"[Ne] 3s² 3p⁵",fusion:"-101°C",ebul:"-34°C",oxyd:"-1",abond:"145 mg/kg",usage:"Désinfection eau, PVC"},
{z:18,sym:"Ar",name:"Argon",mass:40,cat:"gn",row:3,col:18,config:"[Ne] 3s² 3p⁶",fusion:"-189°C",ebul:"-186°C",oxyd:"0",abond:"3,5 mg/kg",usage:"Soudure, ampoules"},
{z:19,sym:"K",name:"Potassium",mass:39,cat:"al",row:4,col:1,config:"[Ar] 4s¹",fusion:"64°C",ebul:"759°C",oxyd:"+1",abond:"20900 mg/kg",usage:"Engrais, bananes"},
{z:20,sym:"Ca",name:"Calcium",mass:40,cat:"at",row:4,col:2,config:"[Ar] 4s²",fusion:"842°C",ebul:"1484°C",oxyd:"+2",abond:"41500 mg/kg",usage:"Os, ciment, craie"},
{z:21,sym:"Sc",name:"Scandium",mass:45,cat:"tr",row:4,col:3,config:"[Ar] 3d¹ 4s²",fusion:"1541°C",ebul:"2836°C",oxyd:"+3",abond:"22 mg/kg",usage:"Alliages Al-Sc"},
{z:22,sym:"Ti",name:"Titane",mass:48,cat:"tr",row:4,col:4,config:"[Ar] 3d² 4s²",fusion:"1668°C",ebul:"3287°C",oxyd:"+4",abond:"5650 mg/kg",usage:"Prothèses, aéronautique"},
{z:23,sym:"V",name:"Vanadium",mass:51,cat:"tr",row:4,col:5,config:"[Ar] 3d³ 4s²",fusion:"1910°C",ebul:"3407°C",oxyd:"+5",abond:"120 mg/kg",usage:"Aciers spéciaux"},
{z:24,sym:"Cr",name:"Chrome",mass:52,cat:"tr",row:4,col:6,config:"[Ar] 3d⁵ 4s¹",fusion:"1907°C",ebul:"2671°C",oxyd:"+3, +6",abond:"102 mg/kg",usage:"Acier inoxydable, chromage"},
{z:25,sym:"Mn",name:"Manganèse",mass:55,cat:"tr",row:4,col:7,config:"[Ar] 3d⁵ 4s²",fusion:"1246°C",ebul:"2061°C",oxyd:"+2, +7",abond:"950 mg/kg",usage:"Acier, piles"},
{z:26,sym:"Fe",name:"Fer",mass:56,cat:"tr",row:4,col:8,config:"[Ar] 3d⁶ 4s²",fusion:"1538°C",ebul:"2862°C",oxyd:"+2, +3",abond:"56300 mg/kg",usage:"Acier, construction"},
{z:27,sym:"Co",name:"Cobalt",mass:59,cat:"tr",row:4,col:9,config:"[Ar] 3d⁷ 4s²",fusion:"1495°C",ebul:"2927°C",oxyd:"+2, +3",abond:"25 mg/kg",usage:"Batteries, pigments bleus"},
{z:28,sym:"Ni",name:"Nickel",mass:59,cat:"tr",row:4,col:10,config:"[Ar] 3d⁸ 4s²",fusion:"1455°C",ebul:"2913°C",oxyd:"+2",abond:"84 mg/kg",usage:"Pièces de monnaie, inox"},
{z:29,sym:"Cu",name:"Cuivre",mass:64,cat:"tr",row:4,col:11,config:"[Ar] 3d¹⁰ 4s¹",fusion:"1085°C",ebul:"2562°C",oxyd:"+1, +2",abond:"60 mg/kg",usage:"Câbles électriques"},
{z:30,sym:"Zn",name:"Zinc",mass:65,cat:"tr",row:4,col:12,config:"[Ar] 3d¹⁰ 4s²",fusion:"420°C",ebul:"907°C",oxyd:"+2",abond:"70 mg/kg",usage:"Galvanisation, crèmes solaires"},
{z:31,sym:"Ga",name:"Gallium",mass:70,cat:"mp",row:4,col:13,config:"[Ar] 3d¹⁰ 4s² 4p¹",fusion:"30°C",ebul:"2204°C",oxyd:"+3",abond:"19 mg/kg",usage:"Semi-conducteurs, LED"},
{z:32,sym:"Ge",name:"Germanium",mass:73,cat:"ml",row:4,col:14,config:"[Ar] 3d¹⁰ 4s² 4p²",fusion:"938°C",ebul:"2833°C",oxyd:"+4",abond:"1,5 mg/kg",usage:"Fibre optique, transistors"},
{z:33,sym:"As",name:"Arsenic",mass:75,cat:"ml",row:4,col:15,config:"[Ar] 3d¹⁰ 4s² 4p³",fusion:"817°C",ebul:"614°C",oxyd:"+3, +5",abond:"1,8 mg/kg",usage:"Semi-conducteurs"},
{z:34,sym:"Se",name:"Sélénium",mass:79,cat:"nm",row:4,col:16,config:"[Ar] 3d¹⁰ 4s² 4p⁴",fusion:"221°C",ebul:"685°C",oxyd:"-2, +4",abond:"0,05 mg/kg",usage:"Cellules solaires"},
{z:35,sym:"Br",name:"Brome",mass:80,cat:"ha",row:4,col:17,config:"[Ar] 3d¹⁰ 4s² 4p⁵",fusion:"-7°C",ebul:"59°C",oxyd:"-1",abond:"2,4 mg/kg",usage:"Retardateurs de flamme"},
{z:36,sym:"Kr",name:"Krypton",mass:84,cat:"gn",row:4,col:18,config:"[Ar] 3d¹⁰ 4s² 4p⁶",fusion:"-157°C",ebul:"-153°C",oxyd:"0",abond:"trace",usage:"Lasers, éclairage"},
{z:37,sym:"Rb",name:"Rubidium",mass:85,cat:"al",row:5,col:1},{z:38,sym:"Sr",name:"Strontium",mass:88,cat:"at",row:5,col:2,usage:"Feux d'artifice rouges"},
{z:39,sym:"Y",name:"Yttrium",mass:89,cat:"tr",row:5,col:3},{z:40,sym:"Zr",name:"Zirconium",mass:91,cat:"tr",row:5,col:4,usage:"Réacteurs nucléaires"},
{z:41,sym:"Nb",name:"Niobium",mass:93,cat:"tr",row:5,col:5},{z:42,sym:"Mo",name:"Molybdène",mass:96,cat:"tr",row:5,col:6,usage:"Aciers haute résistance"},
{z:43,sym:"Tc",name:"Technétium",mass:98,cat:"tr",row:5,col:7,usage:"Imagerie médicale"},{z:44,sym:"Ru",name:"Ruthénium",mass:101,cat:"tr",row:5,col:8},
{z:45,sym:"Rh",name:"Rhodium",mass:103,cat:"tr",row:5,col:9,usage:"Pots catalytiques"},{z:46,sym:"Pd",name:"Palladium",mass:106,cat:"tr",row:5,col:10,usage:"Catalyseurs, bijoux"},
{z:47,sym:"Ag",name:"Argent",mass:108,cat:"tr",row:5,col:11,config:"[Kr] 4d¹⁰ 5s¹",fusion:"962°C",ebul:"2162°C",oxyd:"+1",abond:"0,075 mg/kg",usage:"Bijoux, photographie"},
{z:48,sym:"Cd",name:"Cadmium",mass:112,cat:"tr",row:5,col:12},{z:49,sym:"In",name:"Indium",mass:115,cat:"mp",row:5,col:13,usage:"Écrans tactiles"},
{z:50,sym:"Sn",name:"Étain",mass:119,cat:"mp",row:5,col:14,usage:"Soudure, conserves"},{z:51,sym:"Sb",name:"Antimoine",mass:122,cat:"ml",row:5,col:15},
{z:52,sym:"Te",name:"Tellure",mass:128,cat:"ml",row:5,col:16},{z:53,sym:"I",name:"Iode",mass:127,cat:"ha",row:5,col:17,usage:"Désinfectant, thyroïde"},
{z:54,sym:"Xe",name:"Xénon",mass:131,cat:"gn",row:5,col:18,usage:"Phares auto, anesthésie"},
{z:55,sym:"Cs",name:"Césium",mass:133,cat:"al",row:6,col:1,usage:"Horloges atomiques"},{z:56,sym:"Ba",name:"Baryum",mass:137,cat:"at",row:6,col:2,usage:"Radiologie"},
{z:0,sym:"57-71",name:"Lanthanides",mass:0,cat:"la",row:6,col:3},
{z:72,sym:"Hf",name:"Hafnium",mass:178,cat:"tr",row:6,col:4},{z:73,sym:"Ta",name:"Tantale",mass:181,cat:"tr",row:6,col:5},
{z:74,sym:"W",name:"Tungstène",mass:184,cat:"tr",row:6,col:6,usage:"Filaments, outils"},{z:75,sym:"Re",name:"Rhénium",mass:186,cat:"tr",row:6,col:7},
{z:76,sym:"Os",name:"Osmium",mass:190,cat:"tr",row:6,col:8},{z:77,sym:"Ir",name:"Iridium",mass:192,cat:"tr",row:6,col:9},
{z:78,sym:"Pt",name:"Platine",mass:195,cat:"tr",row:6,col:10,usage:"Bijoux, catalyseurs"},{z:79,sym:"Au",name:"Or",mass:197,cat:"tr",row:6,col:11,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s¹",fusion:"1064°C",ebul:"2856°C",oxyd:"+1, +3",abond:"0,004 mg/kg",usage:"Bijoux, électronique"},
{z:80,sym:"Hg",name:"Mercure",mass:201,cat:"tr",row:6,col:12,usage:"Thermomètres (ancien)"},{z:81,sym:"Tl",name:"Thallium",mass:204,cat:"mp",row:6,col:13},
{z:82,sym:"Pb",name:"Plomb",mass:207,cat:"mp",row:6,col:14,usage:"Batteries, protection X"},{z:83,sym:"Bi",name:"Bismuth",mass:209,cat:"mp",row:6,col:15},
{z:84,sym:"Po",name:"Polonium",mass:209,cat:"ml",row:6,col:16},{z:85,sym:"At",name:"Astate",mass:210,cat:"ha",row:6,col:17},
{z:86,sym:"Rn",name:"Radon",mass:222,cat:"gn",row:6,col:18},
{z:87,sym:"Fr",name:"Francium",mass:223,cat:"al",row:7,col:1},{z:88,sym:"Ra",name:"Radium",mass:226,cat:"at",row:7,col:2},
{z:0,sym:"89-103",name:"Actinides",mass:0,cat:"ac",row:7,col:3},
{z:104,sym:"Rf",name:"Rutherfordium",mass:267,cat:"tr",row:7,col:4},{z:105,sym:"Db",name:"Dubnium",mass:268,cat:"tr",row:7,col:5},
{z:106,sym:"Sg",name:"Seaborgium",mass:269,cat:"tr",row:7,col:6},{z:107,sym:"Bh",name:"Bohrium",mass:270,cat:"tr",row:7,col:7},
{z:108,sym:"Hs",name:"Hassium",mass:277,cat:"tr",row:7,col:8},{z:109,sym:"Mt",name:"Meitnerium",mass:278,cat:"tr",row:7,col:9},
{z:110,sym:"Ds",name:"Darmstadtium",mass:281,cat:"tr",row:7,col:10},{z:111,sym:"Rg",name:"Roentgenium",mass:282,cat:"tr",row:7,col:11},
{z:112,sym:"Cn",name:"Copernicium",mass:285,cat:"tr",row:7,col:12},{z:113,sym:"Nh",name:"Nihonium",mass:286,cat:"mp",row:7,col:13},
{z:114,sym:"Fl",name:"Flérovium",mass:289,cat:"mp",row:7,col:14},{z:115,sym:"Mc",name:"Moscovium",mass:290,cat:"mp",row:7,col:15},
{z:116,sym:"Lv",name:"Livermorium",mass:293,cat:"mp",row:7,col:16},{z:117,sym:"Ts",name:"Tennesse",mass:294,cat:"ha",row:7,col:17},
{z:118,sym:"Og",name:"Oganesson",mass:294,cat:"gn",row:7,col:18},
{z:57,sym:"La",name:"Lanthane",mass:139,cat:"la",row:9,col:3},{z:58,sym:"Ce",name:"Cérium",mass:140,cat:"la",row:9,col:4},
{z:59,sym:"Pr",name:"Praséodyme",mass:141,cat:"la",row:9,col:5},{z:60,sym:"Nd",name:"Néodyme",mass:144,cat:"la",row:9,col:6,usage:"Aimants puissants"},
{z:61,sym:"Pm",name:"Prométhium",mass:145,cat:"la",row:9,col:7},{z:62,sym:"Sm",name:"Samarium",mass:150,cat:"la",row:9,col:8},
{z:63,sym:"Eu",name:"Europium",mass:152,cat:"la",row:9,col:9},{z:64,sym:"Gd",name:"Gadolinium",mass:157,cat:"la",row:9,col:10,usage:"IRM (agent de contraste)"},
{z:65,sym:"Tb",name:"Terbium",mass:159,cat:"la",row:9,col:11},{z:66,sym:"Dy",name:"Dysprosium",mass:163,cat:"la",row:9,col:12},
{z:67,sym:"Ho",name:"Holmium",mass:165,cat:"la",row:9,col:13},{z:68,sym:"Er",name:"Erbium",mass:167,cat:"la",row:9,col:14},
{z:69,sym:"Tm",name:"Thulium",mass:169,cat:"la",row:9,col:15},{z:70,sym:"Yb",name:"Ytterbium",mass:173,cat:"la",row:9,col:16},
{z:71,sym:"Lu",name:"Lutécium",mass:175,cat:"la",row:9,col:17},
{z:89,sym:"Ac",name:"Actinium",mass:227,cat:"ac",row:10,col:3},{z:90,sym:"Th",name:"Thorium",mass:232,cat:"ac",row:10,col:4},
{z:91,sym:"Pa",name:"Protactinium",mass:231,cat:"ac",row:10,col:5},{z:92,sym:"U",name:"Uranium",mass:238,cat:"ac",row:10,col:6,usage:"Combustible nucléaire"},
{z:93,sym:"Np",name:"Neptunium",mass:237,cat:"ac",row:10,col:7},{z:94,sym:"Pu",name:"Plutonium",mass:244,cat:"ac",row:10,col:8,usage:"Sondes spatiales"},
{z:95,sym:"Am",name:"Américium",mass:243,cat:"ac",row:10,col:9,usage:"Détecteurs de fumée"},
{z:96,sym:"Cm",name:"Curium",mass:247,cat:"ac",row:10,col:10},{z:97,sym:"Bk",name:"Berkélium",mass:247,cat:"ac",row:10,col:11},
{z:98,sym:"Cf",name:"Californium",mass:251,cat:"ac",row:10,col:12},{z:99,sym:"Es",name:"Einsteinium",mass:252,cat:"ac",row:10,col:13},
{z:100,sym:"Fm",name:"Fermium",mass:257,cat:"ac",row:10,col:14},{z:101,sym:"Md",name:"Mendélévium",mass:258,cat:"ac",row:10,col:15},
{z:102,sym:"No",name:"Nobélium",mass:259,cat:"ac",row:10,col:16},{z:103,sym:"Lr",name:"Lawrencium",mass:266,cat:"ac",row:10,col:17},
];

const C: Record<string,{bg:string;b:string;t:string;l:string}> = {
  al:{bg:"#fee2e2",b:"#f87171",t:"#991b1b",l:"Alcalins"},
  at:{bg:"#fef3c7",b:"#fbbf24",t:"#92400e",l:"Alcalino-terreux"},
  tr:{bg:"#dbeafe",b:"#60a5fa",t:"#1e40af",l:"Transition"},
  mp:{bg:"#e0e7ff",b:"#818cf8",t:"#3730a3",l:"Métaux pauvres"},
  ml:{bg:"#ede9fe",b:"#a78bfa",t:"#5b21b6",l:"Métalloïdes"},
  nm:{bg:"#dcfce7",b:"#4ade80",t:"#166534",l:"Non-métaux"},
  ha:{bg:"#d1fae5",b:"#34d399",t:"#065f46",l:"Halogènes"},
  gn:{bg:"#e0f2fe",b:"#38bdf8",t:"#0c4a6e",l:"Gaz nobles"},
  la:{bg:"#fce7f3",b:"#f472b6",t:"#9d174d",l:"Lanthanides"},
  ac:{bg:"#ffe4e6",b:"#fb7185",t:"#9f1239",l:"Actinides"},
};

export default function TableauPeriodique() {
  const [sel, setSel] = useState<El|null>(null);
  const [search, setSearch] = useState("");

  const hl = search.trim() ? new Set(D.filter(e=>e.z>0&&(e.name.toLowerCase().includes(search.toLowerCase())||e.sym.toLowerCase().includes(search.toLowerCase())||String(e.z)===search.trim())).map(e=>e.z)) : null;

  function Cell({el}:{el:El|undefined}) {
    if (!el) return <div/>;
    const c = C[el.cat]??{bg:"#f1f5f9",b:"#ccc",t:"#333",l:""};
    const dim = hl && !hl.has(el.z) && el.z>0;
    return (
      <div onClick={()=>el.z>0&&setSel(el)} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:c.bg,border:`1.5px solid ${c.b}`,borderRadius:4,cursor:el.z>0?"pointer":"default",opacity:dim?0.2:1,transition:"all 0.15s",padding:"1px 0",minWidth:0}}
        onMouseEnter={e=>{if(el.z>0){(e.currentTarget).style.transform="scale(1.2)";(e.currentTarget).style.zIndex="10"}}}
        onMouseLeave={e=>{(e.currentTarget).style.transform="scale(1)";(e.currentTarget).style.zIndex="1"}}>
        {el.z===0?<span style={{fontSize:"0.5rem",fontWeight:700,color:c.t}}>{el.sym}</span>:<>
          <span style={{fontSize:"0.4rem",color:"var(--text-muted)",lineHeight:1}}>{el.z}</span>
          <span style={{fontSize:"0.7rem",fontWeight:800,color:c.t,lineHeight:1}}>{el.sym}</span>
        </>}
      </div>
    );
  }

  return (
    <div style={{margin:"1.5rem 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",maxWidth:450,margin:"0 auto 0.6rem",padding:"0.4rem 0.8rem",background:"var(--bg-card)",border:"1px solid var(--border-color)",borderRadius:"var(--radius-pill)"}}>
        <span>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher un nom, symbole ou numéro..." style={{flex:1,border:"none",background:"transparent",fontSize:"0.8rem",color:"var(--text-primary)",outline:"none",fontFamily:"inherit"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:"0.8rem"}}>✕</button>}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.25rem",justifyContent:"center",marginBottom:"0.6rem"}}>
        {Object.entries(C).map(([k,v])=>(<span key={k} style={{display:"inline-flex",alignItems:"center",gap:"0.15rem",padding:"0.12rem 0.4rem",borderRadius:99,background:v.bg,border:`1px solid ${v.b}`,fontSize:"0.55rem",fontWeight:600,color:v.t}}><span style={{width:5,height:5,borderRadius:"50%",background:v.b}}/>{v.l}</span>))}
      </div>
      <div style={{overflowX:"auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(18,1fr)",gap:2,minWidth:580}}>
          {[1,2,3,4,5,6,7].map(r=>Array.from({length:18},(_,i)=>{const el=D.find(e=>e.row===r&&e.col===i+1);return <Cell key={`${r}-${i}`} el={el}/>;}).flat()).flat()}
        </div>
        <div style={{height:8}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(18,1fr)",gap:2,minWidth:580}}>
          {Array.from({length:18},(_,i)=>{const c=i+1;if(c<3)return<div key={`la${c}`}/>;return<Cell key={`la${c}`} el={D.find(e=>e.row===9&&e.col===c)}/>;}).flat()}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(18,1fr)",gap:2,minWidth:580,marginTop:2}}>
          {Array.from({length:18},(_,i)=>{const c=i+1;if(c<3)return<div key={`ac${c}`}/>;return<Cell key={`ac${c}`} el={D.find(e=>e.row===10&&e.col===c)}/>;}).flat()}
        </div>
      </div>
      <p style={{textAlign:"center",fontSize:"0.65rem",color:"var(--text-muted)",marginTop:"0.4rem"}}>Clique sur un élément pour voir ses détails</p>
      {sel&&<>
        <div onClick={()=>setSel(null)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.3)",zIndex:9998}}/>
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:380,maxWidth:"92vw",background:"var(--bg-card)",borderRadius:"var(--radius-lg)",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",zIndex:9999,padding:"1.5rem",maxHeight:"90vh",overflowY:"auto"}}>
          <button onClick={()=>setSel(null)} style={{position:"absolute",top:12,right:12,background:"none",border:"none",fontSize:"1.2rem",cursor:"pointer",color:"var(--text-muted)"}}>✕</button>
          <h3 style={{fontSize:"1.3rem",fontWeight:800,color:"var(--text-primary)",marginBottom:"0.75rem"}}>{sel.name}</h3>
          <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem"}}>
            <div style={{width:70,height:70,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C[sel.cat]?.bg,border:`3px solid ${C[sel.cat]?.b}`}}>
              <span style={{fontSize:"0.55rem",color:"var(--text-muted)"}}>{sel.mass}</span>
              <span style={{fontSize:"1.8rem",fontWeight:900,color:C[sel.cat]?.t,lineHeight:1}}>{sel.sym}</span>
              <span style={{fontSize:"0.5rem",color:"var(--text-muted)"}}>{sel.z}</span>
            </div>
            <div style={{flex:1,fontSize:"0.85rem",color:"var(--text-secondary)"}}>
              <p style={{margin:"0.15rem 0"}}><strong>Z : {sel.z}</strong> | <strong>A : {sel.mass}</strong></p>
              <p style={{margin:"0.15rem 0"}}>Neutrons : {sel.mass-sel.z}</p>
              {sel.oxyd&&<p style={{margin:"0.15rem 0"}}>⚡ Oxydation : <span style={{padding:"0.1rem 0.3rem",background:C[sel.cat]?.bg,borderRadius:4,fontWeight:600}}>{sel.oxyd}</span></p>}
              {sel.abond&&<p style={{margin:"0.15rem 0"}}>🌍 Abondance : {sel.abond}</p>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem",fontSize:"0.8rem",color:"var(--text-secondary)",marginBottom:"0.75rem"}}>
            {sel.config&&<div style={{padding:"0.4rem 0.5rem",background:"var(--bg-secondary)",borderRadius:8}}><span style={{fontSize:"0.6rem",color:"var(--text-muted)"}}>Configuration</span><br/><strong>{sel.config}</strong></div>}
            {sel.fusion&&<div style={{padding:"0.4rem 0.5rem",background:"var(--bg-secondary)",borderRadius:8}}><span style={{fontSize:"0.6rem",color:"var(--text-muted)"}}>🌡️ Fusion</span><br/><strong>{sel.fusion}</strong></div>}
            {sel.ebul&&<div style={{padding:"0.4rem 0.5rem",background:"var(--bg-secondary)",borderRadius:8}}><span style={{fontSize:"0.6rem",color:"var(--text-muted)"}}>🔥 Ébullition</span><br/><strong>{sel.ebul}</strong></div>}
            <div style={{padding:"0.4rem 0.5rem",background:"var(--bg-secondary)",borderRadius:8}}><span style={{fontSize:"0.6rem",color:"var(--text-muted)"}}>👥 Famille</span><br/><strong style={{color:C[sel.cat]?.t}}>{C[sel.cat]?.l}</strong></div>
          </div>
          {sel.usage&&<div style={{padding:"0.5rem 0.75rem",background:"var(--bg-secondary)",borderRadius:8,fontSize:"0.8rem",color:"var(--text-secondary)",fontStyle:"italic"}}>{sel.usage}</div>}
        </div>
      </>}
    </div>
  );
}
