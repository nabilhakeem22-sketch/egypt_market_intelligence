import os
import google.generativeai as genai
from dotenv import load_dotenv
from engine_macro import macro_engine
from engine_micro import micro_engine

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AIOrchestrator:
    def __init__(self):
        # Updated to use a valid available model
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def classify_intent(self, query):
        """
        Uses Gemini to classify the user's intent.
        """
        prompt = f"""
        You are an AI router for an Egypt Market Intelligence platform.
        Classify the following user query into exactly one of these categories:
        - MACRO: Questions about national economic indicators (Inflation, GDP), investment climate, market trends, or "is it a good time to invest".
        - MICRO: Questions about specific locations, rent prices, foot traffic, or local competitors in Cairo.
        - HYBRID: Questions that combine both macro economic factors and specific local business feasibility (e.g., "feasibility of a cafe in Maadi given inflation").
        - GENERAL: Greetings or out-of-scope questions.

        Query: "{query}"
        
        Return ONLY the category name (MACRO, MICRO, HYBRID, or GENERAL).
        """
        try:
            response = self.model.generate_content(prompt)
            intent = response.text.strip().upper()
            # Fallback cleanup in case of extra text
            for valid in ["MACRO", "MICRO", "HYBRID", "GENERAL"]:
                if valid in intent:
                    return valid
            return "GENERAL"
        except Exception as e:
            print(f"Gemini Intent Error: {e}")
            return "GENERAL"

    def process_query(self, query, user_industry="General", dashboard_context=None, simulation_mode=False):
        intent = self.classify_intent(query)
        context = {}
        
        # 1. Retrieve Data (Legacy / Fallback)
        if intent in ["MACRO", "HYBRID"]:
            context['macro'] = macro_engine.get_macro_summary()
        
        if intent in ["MICRO", "HYBRID"]:
            context['micro'] = micro_engine.search(query)

        # 2. Generate Response using Gemini with State Injection
        response_text = self.generate_llm_response(query, intent, context, user_industry, dashboard_context, simulation_mode)
        
        return {
            "intent": intent,
            "response": response_text,
            "data_context": context 
        }

    def generate_llm_response(self, query, intent, context, user_industry="General", dashboard_context=None, simulation_mode=False):
        """
        Uses Gemini to generate a natural language response based on the retrieved data and dashboard context.
        """
        
        # Construct System Context from Dashboard State
        system_context_str = ""
        if dashboard_context:
            filters = dashboard_context.get('filters', {})
            visible_data = dashboard_context.get('visible_data', [])
            
            # Format visible data rows
            formatted_rows = ""
            for i, row in enumerate(visible_data[:10]): # Limit to top 10 for token efficiency
                formatted_rows += f"- Row {i+1}: {row}\n"
            
            system_context_str = f"""
            [SYSTEM CONTEXT]
            Current View: {filters}
            Active Data Points (Top 10):
            {formatted_rows}
            [/SYSTEM CONTEXT]
            """

        simulation_instruction = ""
        if simulation_mode:
            simulation_instruction = """
            MODE: SIMULATION / SCENARIO PLANNING
            - The user is asking a "What-If" question.
            - You must output a Markdown Table comparing "Current State" vs "Projected State".
            - Make reasonable assumptions for the projection based on the user's input (e.g., "Inflation +5%").
            - Explicitly state your assumptions.
            """

        system_instruction = f"""
        You are an expert Egypt Market Intelligence Consultant specializing in the **{user_industry}** sector.
        
        {system_context_str}
        
        {simulation_instruction}

        Instructions:
        1. Answer based on the data provided in [SYSTEM CONTEXT] or 'Context Data'.
        2. IF (Simulation Mode): You are allowed to calculate projections and estimate future values based on user parameters.
        3. IF (Standard Mode): Answer using **ONLY** the provided data. If data is missing, state it.
        4. **CITATION RULE**: When citing a number, you MUST append a source tag if available (e.g., [Source: FS_CAI_001]). If no ID is present, use [Source: System].
        5. Be professional, concise, and helpful.
        """

        data_str = ""
        if 'macro' in context and context['macro']:
            data_str += f"\nMACRO DATA (World Bank):\n{context['macro']}"
        if 'micro' in context and context['micro']:
            data_str += f"\nMICRO DATA (Local Survey):\n{context['micro']}"
        
        if not data_str and not system_context_str:
            data_str = "No specific data found for this query."

        prompt = f"""
        {system_instruction}

        Context Data (Legacy):
        {data_str}

        User Query: "{query}"
        
        Answer:
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"I encountered an error generating the response: {e}"

    def generate_proactive_insight(self, filters, data_summary):
        """
        Generates a short, proactive insight based on current filters and visible data.
        """
        prompt = f"""
        You are a Senior Market Analyst for Egypt.
        
        Context:
        - User is viewing data for: {filters}
        - Data Summary: {data_summary}
        
        Task:
        Generate a single, punchy, 1-sentence insight about this data.
        - Highlight a specific opportunity, risk, or trend.
        - Use an emoji at the start (e.g., 🚀, ⚠️, 💡).
        - Be specific (mention locations/sectors if possible).
        - If data is empty, say: "💡 Select a specific indicator to see detailed insights."
        
        Insight:
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Insight Error: {e}")
            return "💡 Explore the data to uncover market trends."

# Singleton
orchestrator = AIOrchestrator()
