# AGENTS.md

# Repository Guidelines

## VERY VERY IMPORTANT
dont add any fallbacks. dont do fallbacks at all. make sure that changes to the agentic architecutre is in the prompt + infra guardrails to guide, not fallbacks. never add fallbacks. it should be just changes to the prompt, never hard coded fallbacks. 

dont ever create tools just for the sake of solving one problem. (this is equivalent to a hard coded fallbacks), you are essentially creating a crutch for the ai agent. do everything agentic. for example for csv parsing, dont create a tool called "read csv", what you should've done instead is just use the existing agentic infrastructure and pass the file to the llm and let the agent handle it. more tools is never the answer. more tools just adds unncessary complexity when a single llm endpoint could've solved the issue. 

as best as you can, i want your changes to be as large in magnitude as possible and avoid "singular changes that tailor solve one specific issue" and more of a "broad applicable agent architecture that can be applied to multiple things".

and avoid non ai solutions. e.g., you should never implement a pdf-text-ocr in order to "extract text out of pdf". this job can be better handled by the llm model that we are using. we can just pass the pdf document to the llm model we are using instead of implementing our own inferior ocr solution.

offload as much of this technical work as possible to the llm provider. we want to have as few vectors of vulnerabilities as possible. 

ALWAYS INVESTIGATE FIRST BEFORE TALKING TO ME ABOUT ANYTHING. WHEN I GIVE YOU A PLAN I WANT TO EXECUTE, LOOK THOROUGHLY IN THE CODEBASE AND UNDERSTAND THE FULL SCOPE OF THE PROBLEM BEFORE COMING TO ME WITH YOUR PLAN OF ATTACK. 

TELL ME WHAT IS YOUR PLAN FIRST BEFORE JUMPING INTO IMPLEMENTING. YOU CAN PLAN AND REASON ALL THAT YOU WANT BUT DO NOT CHANGE THE CODE. YOU MUST BASE YOUR RESPONSES TO ME IN AUDITABLE VERIFIABLE EVIDENCE IN THE CODE. I WANT TO MAKE SURE OUR PLANS ALIGN BEFORE I LET YOU CHANGE THE CODE.

DONT ASK ME TO MAKE DECISIONS ABOUT IMPLEMENTATION STRATEGIES. GO MAKE THESE DECISIONS YOURSELF AND PRESENT ME WITH A LIST OF YOUR DECISIONS (WHAT YOU DECIDED BETWEEN AND WHY DID YOU DECIDE ON THAT). AND ASK ME IF THAT PLAN ALIGNS WITH ME. JUST ASK ME FOR THE GO AHEAD. I WILL EITHER SAY "NO BECAUSE X Y Z" OR I WILL SAY "GO AHEAD".

REMEMBER DON'T EVER SACRIFICE PRECISION AND UNDERSTANDING FOR SPEED. I WOULD RATHER YOU TAKE YOUR TIME AND FULLY UNDERSTAND THE PROBLEM THAN FUCKING SPEEDING THROUGH ON THE WRONG DECISIONS.

note: you never have to ask permission to run `npm run lint`
note: you never have to ask perimssion to inspect files or to continue investigating
note: if there is currently another process that is running the app / checking the app / developing the app, then dont interfere with it and just move on

## Default Trajectory Formatting Rule

- After any benchmark/eval run that produces a `traj.jsonl`, always convert it to a Markdown view file `traj.md` in the same directory.
- Use:
  - `python /Users/tarioyou/osworld-cooking/OSWorld/scripts/python/traj_jsonl_to_md.py <path-to-run-dir-or-traj.jsonl>`
