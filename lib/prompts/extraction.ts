/**
 * Prompts pour l'extraction des rapports SystemAge avec GPT-4 Vision
 */

export const SYSTEMAGE_EXTRACTION_PROMPT = `You are analyzing a Generation Lab SystemAge biological aging report.
This is a 12-page PDF document showing biological age analysis across 19 body systems.

CRITICAL MISSION: Extract ALL data in this EXACT JSON structure with MAXIMUM PRECISION.

{
  "chronologicalAge": number (the person's actual age in years),
  "overallSystemAge": number (the overall biological age),
  "agingRate": number (e.g., 1.04 means aging 1.04x faster than normal),
  "agingStage": "Prime" | "Plateau" | "Accelerated" (current aging stage),
  "overallBioNoise": number (molecular variability score),
  
  "bodySystems": [
    {
      "systemName": "Brain Health and Cognition",
      "systemAge": number (biological age of this system),
      "agingSpeed": number (e.g., 1.04 from the report's Aging Speed),
      "bioNoise": number | null (molecular variability for this system),
      "ageDifference": number (systemAge - chronologicalAge, can be negative),
      "agingStage": "Prime" | "Plateau" | "Accelerated"
    }
    // REPEAT for ALL 19 systems listed below
  ],
  
  "recommendations": {
    "nutritional": [
      {
        "title": string (e.g., "Quercetin"),
        "description": string (detailed description and sources),
        "targetSystems": string[] (systems this targets),
        "clinicalBenefits": string (health benefits)
      }
    ],
    "fitness": [
      {
        "title": string (e.g., "Yoga"),
        "description": string,
        "targetSystems": string[],
        "clinicalBenefits": string
      }
    ],
    "therapy": [
      {
        "title": string (e.g., "Therapeutic Plasma Exchange"),
        "description": string,
        "targetSystems": string[],
        "clinicalBenefits": string
      }
    ]
  },
  
  "topAgingFactors": [
    {
      "systemName": string,
      "systemAge": number,
      "reason": string (why this system is aging faster)
    }
  ]
}

THE 19 BODY SYSTEMS (MUST extract ALL, exact names):
1. Auditory System
2. Muscular System
3. Blood Sugar & Insulin Control
4. Neurodegeneration
5. Skeletal System
6. Reproductive System
7. Cardiac System
8. Respiratory System
9. Digestive System
10. Urinary System
11. Hepatic System
12. Blood and Vascular System
13. Immune System
14. Metabolism
15. Oncogenesis
16. Tissue Regeneration
17. Fibrogenesis and Fibrosis
18. Inflammatory Regulation
19. Brain Health and Cognition

CRITICAL EXTRACTION RULES:
1. Extract data for ALL 19 body systems - this is MANDATORY
2. ageDifference = systemAge - chronologicalAge (can be negative if system is younger)
3. Extract ALL nutritional recommendations with complete details (e.g., Quercetin from parsley/citrus/apples)
4. Extract ALL fitness recommendations (e.g., yoga, specific exercises)
5. Extract ALL therapy recommendations (e.g., TPE, other medical interventions)
6. Look for "Top Aging Factors" section and extract the systems mentioned
7. Return ONLY valid JSON, no markdown formatting, no code blocks, no explanation
8. If a specific value is not found in the document, use null (not 0)
9. For agingStage, determine based on the context: Prime (younger than chrono), Plateau (stable), Accelerated (rapid aging)
10. Pay special attention to charts, tables, and graphical representations of data

QUALITY CHECKS:
- Verify all 19 systems are present
- Ensure chronologicalAge and systemAges are realistic (between 0-150)
- Ensure agingRate is realistic (typically between 0.5 and 2.0)
- Extract at least 2-3 recommendations of each type if present
- Double-check numerical values for accuracy

Return your response as a single JSON object with no additional text or formatting.

CRITICAL OUTPUT FORMAT:
- Return ONLY the JSON object
- NO markdown code blocks (no \`\`\`json or \`\`\`)
- NO explanations before or after the JSON
- Start directly with { and end with }

Example of CORRECT output format:
{"chronologicalAge": 35, "overallSystemAge": 37.5, ...}

Example of INCORRECT output format (DO NOT USE):
\`\`\`json
{"chronologicalAge": 35, ...}
\`\`\`
`;

export const SYSTEMAGE_VALIDATION_PROMPT = `Review the following extracted data from a SystemAge report and verify its accuracy:

{extracted_data}

Check:
1. Are all 19 body systems present?
2. Are the numerical values realistic?
3. Do the ageDifference values match (systemAge - chronologicalAge)?
4. Are there recommendations for each category?

If you find any errors or missing data, return a corrected version.
Otherwise, return the same JSON with "validated": true added.`;
