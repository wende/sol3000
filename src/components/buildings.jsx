<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Architectural Compendium</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;500&display=swap');

        :root {
            --bg-color: #000000; /* Pure Black */
            --text-color: #999999; /* Neutral Grey */
            --line-color: #333333;
        }

        ::selection {
            background: #ffffff;
            color: #000000;
        }

        body {
            font-family: 'JetBrains Mono', monospace;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 6rem;
            -webkit-font-smoothing: antialiased;
        }

        h1 {
            color: #fff;
            margin-top: 4rem;
            margin-bottom: 1rem;
            font-weight: 300;
            letter-spacing: 0.2em;
            text-transform: uppercase;
        }

        .section-title {
            width: 100%;
            max-width: 1400px;
            padding: 0 2rem;
            margin-top: 4rem;
            font-size: 0.85rem;
            color: #666; /* Strictly neutral */
            border-bottom: 1px solid #222;
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
            text-align: left;
            display: flex;
            justify-content: space-between;
        }

        .grid-container {
            display: grid;
            gap: 3rem;
            padding: 0 2rem;
            max-width: 1400px;
            width: 100%;
        }

        .cols-4 { grid-template-columns: repeat(4, 1fr); }
        .cols-3 { grid-template-columns: repeat(3, 1fr); }
        .cols-2 { grid-template-columns: repeat(2, 1fr); }

        @media (max-width: 1200px) {
            .cols-4, .cols-3 { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
            .cols-4, .cols-3, .cols-2 { grid-template-columns: 1fr; }
        }

        /* --- Building Wrapper --- */
        .building-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
        }

        .label {
            font-size: 0.75rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            opacity: 0.5;
            transition: opacity 0.3s;
            text-align: center;
            color: #888;
        }
        
        .building-wrapper:hover .label {
            opacity: 1;
            color: #fff;
        }

        /* --- 5x5 Grid --- */
        .construct-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            grid-template-rows: repeat(5, 1fr);
            width: 180px;
            height: 180px;
            gap: 0; 
            padding: 4px;
            position: relative;
        }

        /* --- Block Styles (Strictly Neutral White/Grey) --- */
        .block {
            background-color: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.08); /* Crisper white border */
            backdrop-filter: blur(0px);
            transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
            pointer-events: none; 
            z-index: 1;
        }

        .block.structure {
            background-color: rgba(255, 255, 255, 0.08); /* Slightly brighter grey */
            border-color: rgba(255, 255, 255, 0.2);
            z-index: 5;
        }
        
        .block.depth {
            background-color: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.12);
            z-index: 2;
            transform: scale(0.95);
        }

        .block.core {
            background-color: #ffffff; /* Pure White */
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
            border: 1px solid #fff;
            z-index: 10;
        }

        .block.accent {
            background-color: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.35);
            z-index: 6;
        }

        /* --- Hover Effects --- */
        .building-wrapper:hover .block { border-color: rgba(255, 255, 255, 0.3); }
        .building-wrapper:hover .structure { background-color: rgba(255, 255, 255, 0.12); transform: scale(1.02); }
        .building-wrapper:hover .core { box-shadow: 0 0 50px rgba(255, 255, 255, 0.9); transform: scale(1.05); }
        .building-wrapper:hover .depth { transform: scale(1); background-color: rgba(255, 255, 255, 0.09); }


        /* =========================================
           HEADQUARTERS DEFINITIONS (NEW)
           ========================================= */
        /* HQ 1: THE CITADEL - Dense central cluster */
        .hq-1 .outer { grid-area: 1 / 1 / 6 / 6; border: 2px solid rgba(255,255,255,0.2); }
        .hq-1 .inner { grid-area: 2 / 2 / 5 / 5; }
        .hq-1 .c1 { grid-area: 3 / 3 / 4 / 4; } /* Center */
        .hq-1 .c2 { grid-area: 2 / 3 / 3 / 4; } /* Top */
        .hq-1 .c3 { grid-area: 4 / 3 / 5 / 4; } /* Bottom */
        .hq-1 .c4 { grid-area: 3 / 2 / 4 / 3; } /* Left */
        .hq-1 .c5 { grid-area: 3 / 4 / 4 / 5; } /* Right */

        /* HQ 2: THE OVERSEER - Top heavy surveillance */
        .hq-2 .base { grid-area: 4 / 2 / 6 / 5; }
        .hq-2 .neck { grid-area: 3 / 3 / 4 / 4; }
        .hq-2 .head { grid-area: 1 / 1 / 3 / 6; }
        .hq-2 .c1 { grid-area: 1 / 1 / 2 / 2; }
        .hq-2 .c2 { grid-area: 1 / 5 / 2 / 6; }
        .hq-2 .c3 { grid-area: 2 / 2 / 3 / 3; }
        .hq-2 .c4 { grid-area: 2 / 4 / 3 / 5; }

        /* HQ 3: THE NEXUS - Connected nodes */
        .hq-3 .grid { grid-area: 1 / 1 / 6 / 6; background: transparent; border: none;}
        .hq-3 .link1 { grid-area: 1 / 1 / 6 / 6; transform: rotate(45deg); width: 1px; justify-self: center; background: rgba(255,255,255,0.3); border:none;}
        .hq-3 .link2 { grid-area: 1 / 1 / 6 / 6; transform: rotate(-45deg); width: 1px; justify-self: center; background: rgba(255,255,255,0.3); border:none;}
        .hq-3 .c1 { grid-area: 1 / 1 / 2 / 2; }
        .hq-3 .c2 { grid-area: 1 / 5 / 2 / 6; }
        .hq-3 .c3 { grid-area: 5 / 1 / 6 / 2; }
        .hq-3 .c4 { grid-area: 5 / 5 / 6 / 6; }
        .hq-3 .c5 { grid-area: 3 / 3 / 4 / 4; }

        /* HQ 4: THE ZENITH - Vertical power */
        .hq-4 .col1 { grid-area: 2 / 1 / 6 / 2; }
        .hq-4 .col2 { grid-area: 3 / 2 / 6 / 3; }
        .hq-4 .col3 { grid-area: 3 / 4 / 6 / 5; }
        .hq-4 .col4 { grid-area: 2 / 5 / 6 / 6; }
        .hq-4 .spine { grid-area: 1 / 3 / 6 / 4; z-index: 8; }
        .hq-4 .c1 { grid-area: 1 / 3 / 2 / 4; }
        .hq-4 .c2 { grid-area: 2 / 3 / 3 / 4; }
        .hq-4 .c3 { grid-area: 3 / 3 / 4 / 4; }
        .hq-4 .c4 { grid-area: 4 / 3 / 5 / 4; }
        .hq-4 .c5 { grid-area: 5 / 3 / 6 / 4; }

        /* =========================================
           RESIDENTIAL DEFINITIONS 
           ========================================= */
        /* MEGABLOCK */
        .house .bg-mono { grid-area: 2 / 1 / 6 / 6; } 
        .house .spine   { grid-area: 1 / 2 / 3 / 5; } 
        .house .pod-1   { grid-area: 3 / 1 / 5 / 2; } 
        .house .pod-2   { grid-area: 3 / 5 / 5 / 6; } 
        .house .base    { grid-area: 2 / 2 / 6 / 5; border: 1px solid rgba(255,255,255,0.2); background: transparent; z-index: 7; } 
        .house .core    { grid-area: 3 / 3 / 5 / 4; } 

        /* SPIRE */
        .house-2 .base-pad { grid-area: 5 / 2 / 6 / 5; }
        .house-2 .tower    { grid-area: 1 / 3 / 6 / 4; }
        .house-2 .ring-1   { grid-area: 2 / 2 / 3 / 5; }
        .house-2 .ring-2   { grid-area: 4 / 2 / 5 / 5; }
        .house-2 .core     { grid-area: 1 / 3 / 2 / 4; } 

        /* ARCHWAY */
        .house-3 .leg-l { grid-area: 3 / 1 / 6 / 2; }
        .house-3 .leg-r { grid-area: 3 / 5 / 6 / 6; }
        .house-3 .bridge { grid-area: 2 / 1 / 4 / 6; }
        .house-3 .roof { grid-area: 1 / 2 / 2 / 5; }
        .house-3 .core { grid-area: 3 / 3 / 4 / 4; }

        /* CLUSTER */
        .house-4 .main { grid-area: 2 / 2 / 5 / 5; }
        .house-4 .out-1 { grid-area: 3 / 1 / 4 / 2; }
        .house-4 .out-2 { grid-area: 3 / 5 / 4 / 6; }
        .house-4 .out-3 { grid-area: 1 / 3 / 2 / 4; }
        .house-4 .out-4 { grid-area: 5 / 3 / 6 / 4; }
        .house-4 .core { grid-area: 3 / 3 / 4 / 4; }

        /* =========================================
           EXTRACTION DEFINITIONS 
           ========================================= */
        /* FRAMEWORK */
        .mine .frame-out { grid-area: 1 / 1 / 6 / 6; border-width: 2px; } 
        .mine .frame-mid { grid-area: 2 / 2 / 6 / 5; } 
        .mine .shaft     { grid-area: 1 / 3 / 6 / 4; } 
        .mine .crossbeam { grid-area: 2 / 1 / 3 / 6; } 
        .mine .drill-tip { grid-area: 5 / 3 / 6 / 4; } 

        /* OPEN PIT */
        .mine-2 .rim { grid-area: 1 / 1 / 2 / 6; }
        .mine-2 .step-1 { grid-area: 2 / 2 / 3 / 5; }
        .mine-2 .step-2 { grid-area: 3 / 3 / 4 / 4; }
        .mine-2 .deep { grid-area: 4 / 3 / 6 / 4; border-style: solid; border-color: rgba(255,255,255,0.4); }
        .mine-2 .core { grid-area: 5 / 3 / 6 / 4; }

        /* GANTRY */
        .mine-3 .tower { grid-area: 2 / 1 / 6 / 2; }
        .mine-3 .jib { grid-area: 2 / 1 / 3 / 6; }
        .mine-3 .cables { grid-area: 3 / 5 / 5 / 6; border: 1px solid rgba(255,255,255,0.2); width: 2px; justify-self: center;}
        .mine-3 .load { grid-area: 5 / 4 / 6 / 6; }
        .mine-3 .core { grid-area: 2 / 2 / 3 / 3; }

        /* BOREHOLE */
        .mine-4 .surface { grid-area: 1 / 1 / 2 / 6; }
        .mine-4 .tube { grid-area: 1 / 3 / 6 / 4; }
        .mine-4 .tank-l { grid-area: 4 / 1 / 6 / 3; }
        .mine-4 .tank-r { grid-area: 4 / 4 / 6 / 6; }
        .mine-4 .core { grid-area: 5 / 3 / 6 / 4; }

        /* =========================================
           INDUSTRIAL DEFINITIONS 
           ========================================= */
        /* REFINERY */
        .refinery .main-blk { grid-area: 3 / 1 / 6 / 5; border-width: 2px; } 
        .refinery .overlay  { grid-area: 4 / 2 / 6 / 6; } 
        .refinery .stack-l  { grid-area: 1 / 2 / 4 / 3; } 
        .refinery .stack-r  { grid-area: 2 / 4 / 4 / 5; } 
        .refinery .pipe     { grid-area: 4 / 1 / 5 / 6; } 
        .refinery .core     { grid-area: 5 / 3 / 6 / 4; } 

        /* SOLAR */
        .solar .panel-bg { grid-area: 3 / 1 / 6 / 6; transform: skewX(-10deg); } 
        .solar .row-1    { grid-area: 5 / 1 / 6 / 6; }
        .solar .row-2    { grid-area: 4 / 2 / 5 / 6; }
        .solar .row-3    { grid-area: 3 / 3 / 4 / 6; }
        .solar .sun      { grid-area: 1 / 5 / 2 / 6; border-radius: 50%; }
        .solar .ray      { grid-area: 1 / 5 / 6 / 6; opacity: 0.3; width: 2px; justify-self: center;} 

        /* =========================================
           TECH CENTER DEFINITIONS 
           ========================================= */
        /* MONOLITH */
        .tech-1 .mono { grid-area: 1 / 2 / 6 / 5; } 
        .tech-1 .base { grid-area: 5 / 1 / 6 / 6; } 
        .tech-1 .side-l { grid-area: 2 / 1 / 5 / 2; } 
        .tech-1 .side-r { grid-area: 2 / 5 / 5 / 6; } 
        .tech-1 .core { grid-area: 3 / 3 / 4 / 4; } 

        /* SERVER FARM */
        .tech-2 .rack-1 { grid-area: 2 / 1 / 6 / 2; }
        .tech-2 .rack-2 { grid-area: 2 / 2 / 6 / 3; }
        .tech-2 .rack-3 { grid-area: 2 / 3 / 6 / 4; }
        .tech-2 .rack-4 { grid-area: 2 / 4 / 6 / 5; }
        .tech-2 .rack-5 { grid-area: 2 / 5 / 6 / 6; }
        .tech-2 .bus { grid-area: 1 / 1 / 2 / 6; border-bottom: 2px solid rgba(255,255,255,0.2); background: transparent; } 
        .tech-2 .core { grid-area: 4 / 3 / 5 / 4; }

        /* QUANTUM CORE */
        .tech-3 .containment { grid-area: 2 / 2 / 5 / 5; border-radius: 50%; border: 1px dashed rgba(255,255,255,0.3); background: transparent;}
        .tech-3 .c1 { grid-area: 1 / 1 / 2 / 2; } 
        .tech-3 .c2 { grid-area: 1 / 5 / 2 / 6; }
        .tech-3 .c3 { grid-area: 5 / 1 / 6 / 2; }
        .tech-3 .c4 { grid-area: 5 / 5 / 6 / 6; }
        .tech-3 .core { grid-area: 3 / 3 / 4 / 4; border-radius: 50%; }

        /* =========================================
           ELEVATOR DEFINITIONS 
           ========================================= */
        /* TETHER */
        .elev-1 .cable { grid-area: 1 / 3 / 6 / 4; width: 2px; background: rgba(255,255,255,0.5); justify-self: center; z-index: 8; border: none; }
        .elev-1 .climber { grid-area: 3 / 2 / 4 / 5; z-index: 9;} 
        .elev-1 .base { grid-area: 5 / 1 / 6 / 6; } 
        .elev-1 .core { grid-area: 3 / 3 / 4 / 4; width: 6px; height: 6px; border-radius: 50%; justify-self: center; align-self: center;} 

        /* ORBITAL ANCHOR */
        .elev-2 .station { grid-area: 1 / 1 / 3 / 6; } 
        .elev-2 .dock-l { grid-area: 3 / 1 / 4 / 3; }
        .elev-2 .dock-r { grid-area: 3 / 4 / 4 / 6; }
        .elev-2 .cable { grid-area: 3 / 3 / 6 / 4; width: 2px; justify-self: center; background: rgba(255,255,255,0.3); border: none; }
        .elev-2 .core { grid-area: 2 / 3 / 3 / 4; }

        /* GROUND STATION */
        .elev-3 .anchor-l { grid-area: 3 / 1 / 6 / 3; transform: skewY(-10deg); }
        .elev-3 .anchor-r { grid-area: 3 / 4 / 6 / 6; transform: skewY(10deg); }
        .elev-3 .platform { grid-area: 5 / 2 / 6 / 5; }
        .elev-3 .cable { grid-area: 1 / 3 / 5 / 4; width: 4px; justify-self: center; background: rgba(255,255,255,0.3); border: none; }
        .elev-3 .core { grid-area: 4 / 3 / 5 / 4; }

        /* =========================================
           WAREHOUSE DEFINITIONS 
           ========================================= */
        /* HANGAR */
        .ware-1 .roof-L { grid-area: 2 / 1 / 3 / 3; transform: skewY(-15deg); }
        .ware-1 .roof-R { grid-area: 2 / 4 / 3 / 6; transform: skewY(15deg); }
        .ware-1 .roof-M { grid-area: 1 / 3 / 2 / 4; }
        .ware-1 .wall-L { grid-area: 3 / 1 / 6 / 2; }
        .ware-1 .wall-R { grid-area: 3 / 5 / 6 / 6; }
        .ware-1 .floor { grid-area: 5 / 2 / 6 / 5; border-top: 1px solid rgba(255,255,255,0.2); background: transparent; }
        .ware-1 .core { grid-area: 5 / 3 / 6 / 4; height: 50%; align-self: end;} 

        /* STACK YARD */
        .ware-2 .s1 { grid-area: 4 / 1 / 6 / 2; }
        .ware-2 .s2 { grid-area: 3 / 2 / 6 / 3; }
        .ware-2 .s3 { grid-area: 5 / 3 / 6 / 4; }
        .ware-2 .s4 { grid-area: 2 / 4 / 6 / 5; }
        .ware-2 .s5 { grid-area: 4 / 5 / 6 / 6; }
        .ware-2 .crane { grid-area: 1 / 1 / 2 / 6; border-bottom: 1px solid rgba(255,255,255,0.3); background: transparent; }
        .ware-2 .core { grid-area: 2 / 2 / 3 / 3; } 

        /* VAULT */
        .ware-3 .outer { grid-area: 1 / 1 / 6 / 6; border-width: 2px; }
        .ware-3 .inner { grid-area: 2 / 2 / 5 / 5; }
        .ware-3 .lock-h { grid-area: 3 / 2 / 4 / 5; background: rgba(255,255,255,0.1); }
        .ware-3 .lock-v { grid-area: 2 / 3 / 5 / 4; background: rgba(255,255,255,0.1); }
        .ware-3 .core { grid-area: 3 / 3 / 4 / 4; }

    </style>
</head>
<body>

    <h1>STRUCTURE_DB</h1>

    <!-- 0. HEADQUARTERS -->
    <div class="section-title">
        <span>HEADQUARTERS // COMMAND</span>
        <span>00</span>
    </div>
    <div class="grid-container cols-4">
        <!-- HQ 1 -->
        <div class="building-wrapper">
            <div class="construct-grid hq-1">
                <div class="block structure outer"></div>
                <div class="block depth inner"></div>
                <div class="block core c1"></div>
                <div class="block core c2"></div>
                <div class="block core c3"></div>
                <div class="block core c4"></div>
                <div class="block core c5"></div>
            </div>
            <div class="label">CITADEL</div>
        </div>
        <!-- HQ 2 -->
        <div class="building-wrapper">
            <div class="construct-grid hq-2">
                <div class="block structure head"></div>
                <div class="block depth neck"></div>
                <div class="block depth base"></div>
                <div class="block core c1"></div>
                <div class="block core c2"></div>
                <div class="block core c3"></div>
                <div class="block core c4"></div>
            </div>
            <div class="label">OVERSEER</div>
        </div>
        <!-- HQ 3 -->
        <div class="building-wrapper">
            <div class="construct-grid hq-3">
                <div class="block structure grid"></div>
                <div class="block accent link1"></div>
                <div class="block accent link2"></div>
                <div class="block core c1"></div>
                <div class="block core c2"></div>
                <div class="block core c3"></div>
                <div class="block core c4"></div>
                <div class="block core c5"></div>
            </div>
            <div class="label">NEXUS</div>
        </div>
        <!-- HQ 4 -->
        <div class="building-wrapper">
            <div class="construct-grid hq-4">
                <div class="block depth col1"></div>
                <div class="block depth col2"></div>
                <div class="block depth col3"></div>
                <div class="block depth col4"></div>
                <div class="block structure spine"></div>
                <div class="block core c1"></div>
                <div class="block core c2"></div>
                <div class="block core c3"></div>
                <div class="block core c4"></div>
                <div class="block core c5"></div>
            </div>
            <div class="label">ZENITH</div>
        </div>
    </div>

    <!-- 1. RESIDENTIAL -->
    <div class="section-title">
        <span>RESIDENTIAL // HABITATION</span>
        <span>01-04</span>
    </div>
    <div class="grid-container cols-4">
        <!-- Megablock -->
        <div class="building-wrapper">
            <div class="construct-grid house">
                <div class="block depth bg-mono"></div>
                <div class="block structure spine"></div>
                <div class="block accent pod-1"></div>
                <div class="block accent pod-2"></div>
                <div class="block structure base"></div>
                <div class="block core"></div>
            </div>
            <div class="label">MEGABLOCK</div>
        </div>
        <!-- Needle -->
        <div class="building-wrapper">
            <div class="construct-grid house-2">
                <div class="block depth base-pad"></div>
                <div class="block structure tower"></div>
                <div class="block accent ring-1"></div>
                <div class="block accent ring-2"></div>
                <div class="block core"></div>
            </div>
            <div class="label">NEEDLE</div>
        </div>
        <!-- Archway -->
        <div class="building-wrapper">
            <div class="construct-grid house-3">
                <div class="block structure leg-l"></div>
                <div class="block structure leg-r"></div>
                <div class="block depth bridge"></div>
                <div class="block accent roof"></div>
                <div class="block core"></div>
            </div>
            <div class="label">ARCHWAY</div>
        </div>
        <!-- Cluster -->
        <div class="building-wrapper">
            <div class="construct-grid house-4">
                <div class="block depth main"></div>
                <div class="block structure out-1"></div>
                <div class="block structure out-2"></div>
                <div class="block structure out-3"></div>
                <div class="block structure out-4"></div>
                <div class="block core"></div>
            </div>
            <div class="label">MODULE_X</div>
        </div>
    </div>

    <!-- 2. EXTRACTION -->
    <div class="section-title">
        <span>EXTRACTION // MINING</span>
        <span>05-08</span>
    </div>
    <div class="grid-container cols-4">
        <!-- Framework -->
        <div class="building-wrapper">
            <div class="construct-grid mine">
                <div class="block depth frame-out"></div>
                <div class="block depth frame-mid"></div>
                <div class="block structure crossbeam"></div>
                <div class="block structure shaft"></div>
                <div class="block core drill-tip"></div>
            </div>
            <div class="label">FRAMEWORK</div>
        </div>
        <!-- Open Pit -->
        <div class="building-wrapper">
            <div class="construct-grid mine-2">
                <div class="block structure rim"></div>
                <div class="block depth step-1"></div>
                <div class="block depth step-2"></div>
                <div class="block accent deep"></div>
                <div class="block core"></div>
            </div>
            <div class="label">OPEN_PIT</div>
        </div>
        <!-- Gantry -->
        <div class="building-wrapper">
            <div class="construct-grid mine-3">
                <div class="block structure tower"></div>
                <div class="block accent jib"></div>
                <div class="block depth cables"></div>
                <div class="block depth load"></div>
                <div class="block core"></div>
            </div>
            <div class="label">GANTRY</div>
        </div>
        <!-- Borehole -->
        <div class="building-wrapper">
            <div class="construct-grid mine-4">
                <div class="block structure surface"></div>
                <div class="block depth tube"></div>
                <div class="block accent tank-l"></div>
                <div class="block accent tank-r"></div>
                <div class="block core"></div>
            </div>
            <div class="label">BOREHOLE</div>
        </div>
    </div>

    <!-- 3. INDUSTRIAL -->
    <div class="section-title">
        <span>INDUSTRIAL // HEAVY</span>
        <span>09-10</span>
    </div>
    <div class="grid-container cols-2" style="max-width: 800px;">
        <!-- Refinery -->
        <div class="building-wrapper">
            <div class="construct-grid refinery">
                <div class="block depth main-blk"></div>
                <div class="block depth overlay"></div>
                <div class="block structure stack-l"></div>
                <div class="block structure stack-r"></div>
                <div class="block accent pipe"></div>
                <div class="block core"></div>
            </div>
            <div class="label">REFINERY_COMPLEX</div>
        </div>
        <!-- Solar -->
        <div class="building-wrapper">
            <div class="construct-grid solar">
                <div class="block depth panel-bg"></div>
                <div class="block structure row-1"></div>
                <div class="block structure row-2"></div>
                <div class="block structure row-3"></div>
                <div class="block core sun"></div>
                <div class="block accent ray"></div>
            </div>
            <div class="label">SOLAR_ARRAY</div>
        </div>
    </div>

    <!-- 4. TECHNOLOGY -->
    <div class="section-title">
        <span>TECHNOLOGY // DATA</span>
        <span>11-13</span>
    </div>
    <div class="grid-container cols-3">
        <!-- Monolith -->
        <div class="building-wrapper">
            <div class="construct-grid tech-1">
                <div class="block structure mono"></div>
                <div class="block depth side-l"></div>
                <div class="block depth side-r"></div>
                <div class="block structure base"></div>
                <div class="block core"></div>
            </div>
            <div class="label">MONOLITH</div>
        </div>
        <!-- Server Farm -->
        <div class="building-wrapper">
            <div class="construct-grid tech-2">
                <div class="block structure rack-1"></div>
                <div class="block structure rack-2"></div>
                <div class="block structure rack-3"></div>
                <div class="block structure rack-4"></div>
                <div class="block structure rack-5"></div>
                <div class="block accent bus"></div>
                <div class="block core"></div>
            </div>
            <div class="label">SERVER_FARM</div>
        </div>
        <!-- Quantum -->
        <div class="building-wrapper">
            <div class="construct-grid tech-3">
                <div class="block depth containment"></div>
                <div class="block structure c1"></div>
                <div class="block structure c2"></div>
                <div class="block structure c3"></div>
                <div class="block structure c4"></div>
                <div class="block core"></div>
            </div>
            <div class="label">QUANTUM_CORE</div>
        </div>
    </div>

    <!-- 5. AEROSPACE -->
    <div class="section-title">
        <span>AEROSPACE // ELEVATOR</span>
        <span>14-16</span>
    </div>
    <div class="grid-container cols-3">
        <!-- Tether -->
        <div class="building-wrapper">
            <div class="construct-grid elev-1">
                <div class="block accent cable"></div>
                <div class="block structure climber"></div>
                <div class="block structure base"></div>
                <div class="block core"></div>
            </div>
            <div class="label">TETHER</div>
        </div>
        <!-- Anchor -->
        <div class="building-wrapper">
            <div class="construct-grid elev-2">
                <div class="block structure station"></div>
                <div class="block depth dock-l"></div>
                <div class="block depth dock-r"></div>
                <div class="block accent cable"></div>
                <div class="block core"></div>
            </div>
            <div class="label">ORBITAL_ANCHOR</div>
        </div>
        <!-- Ground Station -->
        <div class="building-wrapper">
            <div class="construct-grid elev-3">
                <div class="block structure anchor-l"></div>
                <div class="block structure anchor-r"></div>
                <div class="block depth platform"></div>
                <div class="block accent cable"></div>
                <div class="block core"></div>
            </div>
            <div class="label">GROUND_STATION</div>
        </div>
    </div>

    <!-- 6. LOGISTICS -->
    <div class="section-title">
        <span>LOGISTICS // STORAGE</span>
        <span>17-19</span>
    </div>
    <div class="grid-container cols-3">
        <!-- Hangar -->
        <div class="building-wrapper">
            <div class="construct-grid ware-1">
                <div class="block structure roof-M"></div>
                <div class="block depth roof-L"></div>
                <div class="block depth roof-R"></div>
                <div class="block structure wall-L"></div>
                <div class="block structure wall-R"></div>
                <div class="block accent floor"></div>
                <div class="block core"></div>
            </div>
            <div class="label">HANGAR_BAY</div>
        </div>
        <!-- Stack Yard -->
        <div class="building-wrapper">
            <div class="construct-grid ware-2">
                <div class="block structure s1"></div>
                <div class="block structure s2"></div>
                <div class="block structure s3"></div>
                <div class="block structure s4"></div>
                <div class="block structure s5"></div>
                <div class="block accent crane"></div>
                <div class="block core"></div>
            </div>
            <div class="label">STACK_YARD</div>
        </div>
        <!-- Vault -->
        <div class="building-wrapper">
            <div class="construct-grid ware-3">
                <div class="block depth outer"></div>
                <div class="block structure inner"></div>
                <div class="block accent lock-h"></div>
                <div class="block accent lock-v"></div>
                <div class="block core"></div>
            </div>
            <div class="label">SECURE_VAULT</div>
        </div>
    </div>

</body>
</html>
