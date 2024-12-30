from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import weaviate
import os
import json
import uvicorn
import time
from langchain_openai import OpenAIEmbeddings
from fastapi.middleware.cors import CORSMiddleware
from weaviate.classes.init import AdditionalConfig, Timeout, Auth
from weaviate.classes.query import Filter
from weaviate.classes.query import Sort
from dotenv import load_dotenv
from weaviate.util import generate_uuid5
from openai import OpenAI
from urllib.parse import unquote
from weaviate.classes.query import MetadataQuery

load_dotenv()

class DataSchema(BaseModel):
    id: str
    text: str
    detail: str
    update_vector: Optional[bool] = False
    
class Rating(BaseModel):
    id: str
    rating: str 

class FilterQuery(BaseModel):
    value: str
class FilterFile(BaseModel):
    feature: str

class FeedbackSchema(BaseModel):
    feedback: Optional[str] = None
    ratings: List[Rating]
    filterQuery: FilterQuery 
    filterFile: FilterFile
    selectedUser: str
    feedbackType: str

# Initialize FastAPI
app = FastAPI()

origins = ["*"]
# origins = [
#     "http://localhost", 
#     "http://localhost:3000",  
#     "http://74.241.130.204:3000",  # Replace with your frontend's actual domain
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Connect to Weaviate client
# client = weaviate.Client("http://localhost:8080")  # Adjust the host if different
# client = weaviate.Client(url="https://v1yy0nvrwiz76812qpq.c0.europe-west3.gcp.weaviate.cloud", auth_client_secret=weaviate.AuthApiKey(api_key="Q1AtkyKiuRLSiB4yth7Lm1db6ig64HzHaAyI") )
# client = weaviate.Client(url="http://localhost:8080", auth_client_secret=weaviate.AuthApiKey(api_key="lac9ab923c3bab9d9bf25bec0a425c8810178cbe2f6453ad6392757df74ba677e3b070a75") )

# weaviate_api_key = os.getenv('WEAVIATEAPIKEY')

# client = weaviate.connect_to_local(
#     host="127.0.0.1",  # Use a string to specify the host
#     port=8080,
#     # grpc_port=50051,
#     auth_credentials=Auth.api_key(weaviate_api_key)
#     # headers={
#     #     "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]
#     # }
# )

weaviate_api_key = os.getenv('WEAVIATEAPI')


valid_url = os.getenv('WEAVIATEURL')
auth_config = Auth.api_key(weaviate_api_key)
headers=None

algorithm = "query expansion"

print(valid_url)
print("$$$$$$$$$$$$$$$$$$$$$")

client = weaviate.connect_to_custom(
                http_host=valid_url,
                http_port="80",
                http_secure=False,
                grpc_host=valid_url,
                grpc_port="50051",
                grpc_secure=False,
                auth_credentials=auth_config,
                headers=headers,
                additional_config=AdditionalConfig(
                    timeout=Timeout(init=30, query=60, insert=120),  # Increase timeouts if necessary
                ),
                skip_init_checks=True  # This skips the gRPC health check                           
            )

os.environ["OPENAI_API_KEY"] = "sk-proj-AdM0nH54XoyiPAfobC6tT3BlbkFJoYUWXFLOBWnNmPacyYfS"
embedding = OpenAIEmbeddings(model="text-embedding-3-small")
# Initialize your class name
class_name = "DocumentTemplate"  # Replace with your actual class name in Weaviate


persons = [
    {"id": 1, "name": "test"},
    {"id": 2, "name": "domenico"},
    {"id": 3, "name": "rizan"}
    # {"id": 2, "name": "user2"},
    # {"id": 3, "name": "user3"},
    # {"id": 4, "name": "user4"},
]

with open("category_lists.json", "r") as f:
    category_lists = json.load(f)

with open("./prompts/thematic_classification_for_queries.txt", "r") as f:
    query_analyzer_prompt = f.read()

with open("./prompts/thematic_classification_provided_by_domenico.txt", "r") as f:
    query_analyzer_prompt_domenico = f.read()

with open("./prompts/question_generation.txt", "r") as f:
    question_generator_prompt =f.read()

with open("./prompts/question_generation_by_domenico.txt", "r") as f:
    question_generator_prompt_by_domenico =f.read()

# @app.get("/names")
# async def get_names():
#     try:
#         # Return the list of names
#         return {"message": "List of names retrieved successfully", "names": persons}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.get("/names")
async def get_names():
    try:
        names = [person["name"] for person in persons]
        return {"message": "List of names retrieved successfully", "names": names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to add new data
@app.post("/add")
async def add_data(data: DataSchema):
    try:
        update_data = {
            "detail": data.detail,
            "text": data.text,
        }
        vector = embedding.embed_documents([data.text])[0]    
            
        # uuid = client.data_object.create(class_name=class_name, data_object=update_data, vector=vector)
        collection = client.collections.get(class_name)

        uuid = collection.data.insert(properties=update_data,vector=vector)
        return {"message": "Data added successfully", "uuid": uuid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to get data by id
# @app.get("/get/{id}")
# async def get_data(id: str):
#     try:
#         obj = client.data_object.get_by_id(id)
        
#         if obj:
#             return obj['properties']
#         else:
#             raise HTTPException(status_code=404, detail="Data not found")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/getall")
async def get_all_data( page: int = Query(1),
                        page_size: int = Query(20),
                        filter: str = Query(None)):
    try:

        # print("122333344444445555555555666666")
        # print(page)
        # print(page_size)
        # print(filter)
        try:
            filter = eval(filter)
        except:
            pass
        # print("here ?")

        # print(type(filter))

        # print("here ?")
        if type(filter) == dict:
            where_clause_list = []
            if "classname" in filter:
                print("here 2")
                where_clause_list.append({
                    "path": ["type"],
                    "operator": "Like",
                    "valueString": filter["classname"]
                    })
            if "text" in filter:
                print("here 3")
                where_clause_list.append({
                    "path": ["text"],
                    "operator": "Like",
                    "valueString": filter["text"]
                    })
            if "detail" in filter:
                    print("here 4")
                    where_clause_list.append({
                        "path": ["detail"],
                        "operator": "Like",
                        "valueString": filter["detail"]
                        })
            where_filter = {
                "operator": "And",
                "operands": where_clause_list
                }  

            where_clause_list = []
            if "classname" in filter:
                print("here 2")
                where_clause_list.append(Filter.by_property("type").like(filter["classname"])) #.equal("Double Jeopardy!")
            
            if "text" in filter:
                print("here 3")
                where_clause_list.append(Filter.by_property("text").like(filter["text"])) #.equal("Double Jeopardy!")

            if "detail" in filter:
                print("here 4")
                where_clause_list.append(Filter.by_property("detail").like(filter["detail"])) #.equal("Double Jeopardy!")

            filters = Filter.all_of(where_clause_list)
            # for each_clause in where_clause_list:
            #     filters=
            #     (
            #         Filter.by_property("round").equal("Double Jeopardy!") &
            #         Filter.by_property("points").less_than(600)
            #     ),
     
            # # print("here 2")
            # query_result = (
            # client.query
            # .get("DocumentTemplate", ["text", "detail"])
            # .with_additional("id")
            # .with_where(where_filter)
            # .with_limit(int(page_size))
            # .with_offset((int(page) - 1)*int(page_size))
            # .do()
            # )
            collection = client.collections.get("DocumentTemplate")

            print(filters)

            query_result = collection.query.fetch_objects(

                # where=where_filter,
                filters=filters,
                limit=page_size,
                offset=(int(page) - 1)*int(page_size)
            )
        else:
            # print("ok here")
            # where_filter = {
            #         "path": ["type"],
            #         "operator": "Equal",
            #         "valueString": filter["classname"]
            #         }
            collection = client.collections.get("DocumentTemplate")

            query_result = collection.query.fetch_objects(

                # where=where_filter,
                # filters=filters
                limit=page_size,
                offset=(int(page) - 1)*int(page_size)
            )
            # query_result = (
            # client.query
            # .get("DocumentTemplate", ["text", "detail"])
            # .with_additional("id")
            # # .with_where(where_filter)
            # .with_limit(int(page_size))
            # .with_offset((int(page) - 1)*int(page_size))
            # .do()
            # ) 
        # obj = client.query.get(class_name,["text","detail","_additional {id}",]).do()
        
        print(query_result)
        further_result = []

        for r in query_result.objects:
            properties = r.properties
            properties["_additional"] =  { "id":str(r.uuid)}
            further_result.append(properties)
        query_result = {"data": {"Get": {"DocumentTemplate": further_result }} }
        print(type(query_result))
        if query_result:
            return query_result
        else:
            raise HTTPException(status_code=404, detail="Data not found")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to update data by id
@app.put("/update/{id}")
async def update_data(id: str, data: DataSchema):
    try:
        print(data)
        update_data = {
            "detail": data.detail,
        }

        # obj = client.data_object.get_by_id(id)
        collection = client.collections.get(class_name)

        obj = collection.query.fetch_object_by_id(uuid=id,include_vector=True)
        print("object")
        print(obj)
        obj_data = obj.properties

        # sfwfeewfew
        if obj_data["text"] != data.text:
            update_data["text"] = data.text
            vector = embedding.embed_documents([data.text])[0]
            print("$$$$$$$$$$$$$$$$$$$$--------------------------")
            print(update_data)
            # client.data_object.update(uuid=id , class_name=class_name, data_object=update_data, vector=vector)
            collection.data.update(uuid=id , properties=update_data, vector=vector)
        else:
            print("$$$$$$$$$$$$$$$$$$$$-------------------------- 2")
            print(update_data)
            # client.data_object.update(uuid=id , class_name=class_name, data_object=update_data)
            collection.data.update(uuid=id , properties=update_data, vector=obj.vector["default"])
        return {"message": "Data updated successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to delete data by id (optional)
@app.delete("/delete/{id}")
async def delete_data(id: str):
    try:
        # client.data_object.delete(class_name, id)
        collection = client.collections.get(class_name)
        collection.data.delete_by_id(id)
        return {"message": "Data deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# @app.post("/context")
# async def context_data(data: dict):
#     try:
#         print(data)
#         if "context" in data:
#             print("inside here")
#             nearVector = {
#             "vector": embedding.embed_documents([data["context"]])[0]  # Replace with a compatible vector
#             }

#             query_result = (
#                     client.query
#                     .get("DocumentTemplate", ["text", "detail"])
#                     .with_additional("id")
#                     .with_near_vector(nearVector)
#                     .do()
#                     )
#             print("the results")
#             # print(query_resu/lt)
#             final_result = create_relationship_data(query_result)
#             print("done")
#             # print(final_result)
#             return {"message": "Data context successfully", "query_result": final_result}
#         else:
#             return {"message": "Data context successfully", "query_result": [{"id": "xyz" , "article_name": "something else" , "article_detail": "ewfeewfef weewf wef ef w efw ef ew e wfe", "date-from": "2015-07-01" , "date-to": "2017-03-01" , "supporting_articles": [{"id": "123456" , "name":"supporting 1"},{"id": "123456" , "name":"supporting 2"},{"id": "123456" , "name":"supporting 4"}] , "update_articles": [{"id": "123456" , "name":"updating 1"},{"id": "123456" , "name":"updating 2"},{"id": "123456" , "name":"updating 3"}]}],}
        
#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/context")
# async def context_data(data: dict):
#     try:
#         print(data)
#         if "context" in data:
#             print("inside here")
#             # nearVector = {
#             # "vector": embedding.embed_documents([data["context"]])[0]  # Replace with a compatible vector
#             # }

#             # query_result = (
#             #         client.query
#             #         .get("DocumentTemplate", ["text", "detail"])
#             #         .with_additional("id")
#             #         .with_near_vector(nearVector)
#             #         .do()
#             #         )
#             # print("the results")
#             # print(query_resu/lt)
#             final_result = search_by_vector(data["context"])
#             # final_result = create_relationship_data(query_result)
#             print("done")
#             # print(final_result)
#             return {"message": "Data context successfully", "query_result": final_result}
#         else:
#             return {"message": "Data context successfully", "query_result": []} #{"message": "Data context successfully", "query_result": [{"id": "xyz" , "article_name": "something else" , "article_detail": "ewfeewfef weewf wef ef w efw ef ew e wfe", "date-from": "2015-07-01" , "date-to": "2017-03-01" , "supporting_articles": [{"id": "123456" , "name":"supporting 1"},{"id": "123456" , "name":"supporting 2"},{"id": "123456" , "name":"supporting 4"}] , "update_articles": [{"id": "123456" , "name":"updating 1"},{"id": "123456" , "name":"updating 2"},{"id": "123456" , "name":"updating 3"}]}],}
        
#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/context")
async def context_data(
    page: int = Query(1, ge=1, description="Page number for pagination, starts from 1"),
    size: int = Query(10, ge=1, description="Number of items per page, defaults to 10"),
    filter: str = Query(..., description="Filter JSON encoded as a string")
):
    try:
        decoded_filter = unquote(filter)  
        parsed_filter = json.loads(decoded_filter)  
        
        # Extract `query` and `fileFilter` from the filter
        query = parsed_filter.get("query")
        fileFilter = parsed_filter.get("database")
        # print("888888888888888888888888888888", query, fileFilter)
        # if not query or not fileFilter:
        #     raise HTTPException(status_code=400, detail="Filter must include 'query' and 'fileFilter' fields.")
#, page=page, size=size
        final_result = search_by_vector(query)

        return {
            "message": "Data context successfully fetched",
            "query_result": final_result,
            "totalcontexts": len(final_result),
            "page": 1, #final_result["page"],
            "size": len(final_result), #final_result["size"]
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid filter format. Must be a valid JSON string.")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
   
@app.post("/context/submit-feedback")
async def submit_feedback(data: FeedbackSchema):
    try:
        # queryId = str(hash(data.searchQuery))
        queryId = str(generate_uuid5(data.filterQuery.value + algorithm))
        feedbackId = str(int(time.time()))  
        print("ttttttttttttttttttttttttttt")
        feedback_data = {
            "queryId": queryId,  
            "feedbackId": feedbackId,  
            "feedback": data.feedback,  
            "ratings": [{"id": rating.id, "rating": rating.rating} for rating in data.ratings],
            "filterQuery": data.filterQuery.value,
            "selectedUser":data.selectedUser,
            "type": data.filterFile.feature,
            "feedbackType":data.feedbackType,
            "model": algorithm
        }

        print("Feedback data to be saved:")
        print(feedback_data)  
        try:
            insert_feedback_details(feedback_data)
        except Exception as e:
            print(e)
            return {"message": "The Query already exists in database", "feedbackId": feedbackId, "queryId": queryId}
            # raise HTTPException(status_code=500, detail="Error saving feedback: The Query already exists in database")
            # print("Error occurred while saving feedback")

        return {"message": "Feedback submitted successfully", "feedbackId": feedbackId, "queryId": queryId}
    except Exception as e:
        print("Error occurred:", str(e))  
        raise HTTPException(status_code=500, detail="Error saving feedback: " + str(e))
    
def create_db_fields(data):
    fields = {'queryId', 'feedbackId', 'feedback', 'searchQuery','selectedUser'}
    result = {k: data[k] for k in fields & data.keys()}
    
    if 'ratings' in data:
        result['ratings'] = json.dumps(data['ratings'])
    
    return result

def insert_feedback_details(data):
    collection = client.collections.get("Context_feedback")
    data_obj = create_db_fields(data)
    collection.data.insert(
                properties=data_obj,
                uuid=data_obj["queryId"],
                # vector=vectors[i]
            )

def update_feedback_details(id, data):
    collection = client.collections.get("Context_feedback")
    data_obj = create_db_fields(data)
    collection.data.update(
                properties=data_obj,
                uuid=id
            )

def extract_relevant_fields_from_query(query):
    try:

        openai_client = OpenAI(api_key="sk-95c9f749e10f4293b7081542cb69c7b2", base_url="https://api.deepseek.com")
        # openai_client = OpenAI()
        model = "deepseek-chat"
        # model = "gpt-4o-mini"
        response = openai_client.chat.completions.create(
        model=model,
        messages=[
            {
            "role": "system",
            "content": [
                {
                "type": "text",
                "text": "Analyze a user's query in Italian related to Italian law and extract relevant legal signals.\n\n# Steps\n\n1. **Language**: Assume the query is written in Italian and pertains to Italian law.\n2. **Understanding**: Interpret the query with a focus on legal context and terminology.\n3. **Extraction**: Identify and extract specific legal elements and contextual information from the query.\n\n# Output Format\n\nProvide a structured JSON output containing the following fields:\n- `specific_laws`: A list of specific laws mentioned in the query. If no law is mentioned with number and year then this should be empty. Each law should be represented as an object with:\n  - `name`: The full name of the law (e.g., \"R.D. March 16, 1942, No. 262\").\n  - `number`: The number of the law (e.g., \"262\").\n  - `year`: The year the law was enacted (e.g., \"1942\") -`articlenumber`: If article number have been mentioned (e.g., \"7\" or \"34\") .\n- `case_type`: The inferred case type based on the query Must be among \"Civil Law\", \"Criminal Law\" , \"Labor Law\". \n- `context`: A summary of relevant signals from the query, including:\n  - Key topics \n  - Involved parties\n  - Legal scenario - combination of the key topics in an expanded best query formation\n- `noise`: Any irrelevant or rhetorical parts of the query (optional).\n\n# Examples\n\n**Example 1:**\n\n*Input:* \"Quali sono le implicazioni legali della responsabilità civile per danni alla proprietà secondo il Codice delle assicurazioni?\"\n\n*Output:*\n```json\n{\n  \"specific_laws\": [\n    {\n      \"name\": \"Codice delle assicurazioni\",\n      \"number\": \"\",\n      \"year\": \"\"\n    }\n  ],\n  \"case_type\": \"Civil Law\",\n  \"context\": {\n    \"key_topics\": [\"responsabilità civile\", \"danni alla proprietà\"],\n    \"involved_parties\": [],\n    \"legal_scenario\": \"responsabilità civile per danni alla proprietà\"\n  },\n  \"noise\": \"\"\n}\n```\n\n# Notes\n\n- The field `specific_laws` may contain empty strings for `number` and `year` if those details are not provided in the query.\n- The `noise` field is optional and should only include content that is deemed irrelevant or rhetorical."
                }
            ]
            },
            {
            "role": "user",
            "content": [
                {
                "type": "text",
                "text": query
                }
            ]
            }
        ],
        response_format={
            "type": "json_object"
        },
        temperature=1,
        max_tokens=2048,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
        )
        message = response.choices[0].message.content
        print(type(message))
        print(message)
        message = eval(message)
        returned_message = {}

        agents = {
            "Civil Law": ["REGIO DECRETO 16 marzo 1942, n. 262", "REGIO DECRETO 28 ottobre 1940, n. 1443"],
            "Criminal Law": ["ROYAL DECREE 19 October 1930, n. 1398","DECRETO DEL PRESIDENTE DELLA REPUBBLICA 22 settembre 1988, n. 447"],
            "Labor Law": ["REGIO DECRETO 16 marzo 1942, n. 262", "LEGGE 20 maggio 1970, n. 300"]
        }
        # print("fef" + message["case_type"] + "fewfwef")
        # print(list(agents.keys()))
        if "case_type" in message and message["case_type"] in list(agents.keys()):
            # print("huuuuuuuuu")
            returned_message["laws"] = agents[message["case_type"]]
        else:
            returned_message["laws"] = []

        if "context" in message:
            if "key_topics" in message["context"]:
                returned_message["key_topics"] = message["context"]["key_topics"]
            else:
                returned_message["key_topics"] = []
            if "legal_scenario" in message["context"]:
                returned_message["legal_scenario"] = message["context"]["legal_scenario"]
            else:
                returned_message["legal_scenario"] = ""
        else:
            returned_message["key_topics"] = []
            returned_message["legal_scenario"] = ""

        if "specific_laws" in message and type(message["specific_laws"]) == list:
            all_laws = []
            for l in  message["specific_laws"]:
                if "number" in l and "year" in l:
                    x = {
                        "law_number": l["number"],
                        "law_year": l["year"],
                        
                    }
                    if "articlenumber" in l and l["articlenumber"] != "":
                        x["articlenumber"] = l["articlenumber"]
                    all_laws.append(x)
            returned_message["specific_laws"] = all_laws
        else:
            returned_message["specific_laws"] = []

        return returned_message
    except Exception as e:
        print(e)
        return {
                "specific_laws": [],
                "case_type": "Civil Law",
                "context": ""
               }
        # raise Exception("An error occurred while retrieving the chat history") from e
    
def get_result_for_extracted_details(extracted_detail, text):
    
    nearVector = {
            "vector": embedding.embed_documents([text])[0] 
            }


    where_clause_list = [] 
               
    where_clause_list.append(Filter.by_property("category").like('"status": "in_force"')) #.equal("Double Jeopardy!")

    or_where_clause_list = []
    and_where_clause_list = []
    limit_amount = 5
    if "laws" in extracted_detail:
        for i in extracted_detail["laws"]:
            or_where_clause_list.append(Filter.by_property("tags").like(i))

        

        or_filters = Filter.any_of(or_where_clause_list)
        # where_clause_list.append(Filter.by_property("category"). .like('"update_name": "21"'))
        # where_clause_list.append(or_filters)
        print("11111111")
        # where_clause_list.append(or_filters)
        filters = Filter.all_of(where_clause_list)
        print(filters)
        filters = filters.__and__(or_filters)
        print(filters)
        print("22222222222")

        limit_amount = 5
    
    if "specific_laws" in extracted_detail:
        for i in extracted_detail["specific_laws"]:
            if "law_number" in i:
                and_where_clause_list.append(Filter.by_property("tags").like(i["law_number"]))
            if "law_year" in i:
                and_where_clause_list.append(Filter.by_property("tags").like(i["law_year"]))
            if "articlenumber" in i:
                and_where_clause_list.append(Filter.by_property("metadata").like(i["articlenumber"]))
            where_clause_list.extend(and_where_clause_list)
            print(where_clause_list)
            filters = Filter.all_of(where_clause_list)

            # print(filters)
            limit_amount = 2

    # print(filters)
    # filters = Filter.any_of(where_clause_list)
    # filters = Filter.
    # where_filter = {
    #                 "operator": "And",
    #                 "operands": where_clause_list
    #                 }  

    # print(filters)
   

    

    collection = client.collections.get("National_articles")

    print("efwfweffwefwef")

    print(filters)
    print("efwfweffwefwef")


    object_result = collection.query.near_vector(near_vector=nearVector["vector"] , filters=filters , limit=limit_amount) #, filters=filters
    # object_result = collection.query.fetch_objects(filters=filters , limit=500) # .near_vector(near_vector=nearVector["vector"] , filters=filters , limit=limit_amount) 
    # print(object_result)
    result = []

    for r in object_result.objects:
        properties = r.properties
        properties["id"] = str(r.uuid)
        result.append(r.properties)
        # object_result

    # result = result.objects #result["data"]["Get"]["National_articles"]
    # print(result)
    # for r in result:

        # print(r["_additional"])
    result = convert_to_dict(result)
    returned_data = structure_found_result(result)
    for index, r in enumerate(result):
        # print("working")
        # print(index)
        # refered_links = create_relationship_data(r["metadata"]["refered_articles"])
        # # print("one passed")
        # updated_all_links = create_relationship_data(r["metadata"]["update_articles"])
        
        # updated_articles = get_updates_of_article(r)
        # print("here")
        returned_data[index]["supporting_articles"] = []
        returned_data[index]["update_articles"] = []
        returned_data[index]["updated_articles"] = []
        # print("done")

    return returned_data


# def get_query_analyzer_with_question(query):
#     # openai_client = OpenAI(api_key="sk-95c9f749e10f4293b7081542cb69c7b2", base_url="https://api.deepseek.com")
#     openai_client = OpenAI()
#     # model = "deepseek-chat"
#     model = "gpt-4o-mini"
#     # response = openai_client
#     chat_completion = openai_client.chat.completions.create(
#       model= model, #"deepseek-chat",
#       messages=[{"role": "system", "content": """
#                 You are a highly experienced legal expert in property law and disputes. Your task is to analyze and solve a complex legal question using a systematic approach. Break down the scenario, identify the relevant legal principles, and structure your response as if you were preparing a professional opinion or advice for a client.

#                 For the given legal scenario:

#                 Identify the Key Issues: Clearly state the main legal issues arising from the situation.
#                 Research Legal Principles: Outline the applicable laws, precedents, or regulations relevant to each issue.
#                 Evaluate Possible Actions: Describe the options available to the person involved, including any remedies, legal actions, or preventive measures.
#                 Simulate Question Generation: Formulate 3-5 key questions that would allow to identify the key issues mentioned

#                 Example Scenario:
#                 A neighbor has planted a row of tall trees along the property line, blocking sunlight to your garden and reducing the effectiveness of your solar panels. Despite multiple requests, the neighbor has refused to trim the trees or adjust their placement. You are concerned about the financial impact on your energy bills and the enjoyment of your property. Do you have any legal recourse to address this issue?


#                 Generated Questions:

#                 Are there specific laws or local regulations concerning tree height and property boundaries?
#                 Do property owners have a legal right to sunlight or unobstructed access to solar energy?
#                 What legal remedies exist for financial losses caused by a neighbor’s trees blocking sunlight?
#                 Are there any mediation or arbitration processes for resolving disputes between neighbors?
#                 What actions can be taken if a neighbor refuses to cooperate after being informed of the problem?

#                 Output only the generated questions as json
                
#                 {
#                    "questions": list
#                 }
                
#                 """

#                 },
#                   {
#                     "role": "system", "content": query
#                   }

#                 ],
#       response_format={
#       "type": "json_object"
#         },

#     )
#     result = json.loads(chat_completion.choices[0].message.content)
#     return result


# def get_combined_result(questions):
#     results = []
#     print(type(questions))
#     print(questions)
#     collection = client.collections.get("National_articles")
#     for q in questions["questions"]:
#         # query_vector = op_client.embeddings.create(input = [text], model="text-embedding-3-small").data[0].embedding
#         query_vector = embedding.embed_documents([q])[0] 
#         one_result = collection.query.near_vector(
#         near_vector=query_vector,
#         filters=Filter.by_property("category").like('"status": "in_force"'),
#         limit=2,
#         return_metadata=MetadataQuery(distance=True)
#         )
#         for o in one_result.objects:
#             print(o.metadata.distance)
#             if o.metadata.distance > 0.4:
#                 properties = o.properties
#                 properties["id"] = str(o.uuid)
#                 # result.append(r.properties)
#                 results.append(properties)
#     print("getting combined result about to end")
#     result = convert_to_dict(results)
#     returned_data = structure_found_result(result)
#     for index, r in enumerate(result):
#         # print("working")
#         # print(index)
#         # refered_links = create_relationship_data(r["metadata"]["refered_articles"])
#         # # print("one passed")
#         # updated_all_links = create_relationship_data(r["metadata"]["update_articles"])
        
#         # updated_articles = get_updates_of_article(r)
#         # print("here")
#         returned_data[index]["supporting_articles"] = []
#         returned_data[index]["update_articles"] = []
#         returned_data[index]["updated_articles"] = []

#     return returned_data

def get_query_analyzer_with_question(query):
    print(query)
    # openai_client = OpenAI(api_key="sk-95c9f749e10f4293b7081542cb69c7b2", base_url="https://api.deepseek.com")
    openai_client = OpenAI()
    # model = "deepseek-chat"
    model = "gpt-4o-mini"
    # response = openai_client


                # Example Scenario:
                # You purchased an expensive laptop online, but when it arrived, it was defective and didn’t match the specifications advertised. Despite contacting the seller multiple times for a refund or replacement, they have refused to cooperate. You are unsure about your consumer rights and the legal steps you can take to resolve the issue.


                # Generated Questions:

                # What legal rights do consumers have when receiving defective or misrepresented products?
                # Are online retailers legally obligated to offer refunds or replacements for defective products?
                # Can a company be held liable for advertising a product with specifications it doesn’t meet?
                # What legal remedies are available to customers if an online seller refuses to provide a refund or replacement?
                # Are there any consumer protection agencies or dispute resolution services available to address such cases?
                # Can refusing to address defective product claims be considered a fraudulent business practice under the law?
    chat_completion = openai_client.chat.completions.create(
      model= model, #"deepseek-chat",
      messages=[{"role": "system", "content": question_generator_prompt
                 
                #  """
                # You are a highly experienced legal expert in property law and disputes. Your task is to analyze and solve a complex legal question using a systematic approach. Break down the scenario, identify the relevant legal principles, and structure your response as if you were preparing a professional opinion or advice for a client.

                # For the given legal scenario:

                # Identify the Key Issues: Clearly state the main legal issues arising from the situation.
                # Research Legal Principles: Outline the applicable laws, precedents, or regulations relevant to each issue.
                # Evaluate Possible Actions: Describe the options available to the person involved, including any remedies, legal actions, or preventive measures.
                # Simulate Question Generation: Formulate 5-10 key questions that would allow to identify the key issues mentioned.
                # The Questions must discuss or address one subject or object at a time

                # Output only the generated questions as json

                # {
                #    "questions": list
                # }
                # """
                },{"role": "user", "content": query}
                ],
      response_format={
      "type": "json_object"
        },
        temperature=1,
        max_completion_tokens=2048,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0

    )
    result = json.loads(chat_completion.choices[0].message.content)
    print(result)
    # fawf
    return result

def get_query_analyzer(query):
  # openai_client = OpenAI(api_key="sk-95c9f749e10f4293b7081542cb69c7b2", base_url="https://api.deepseek.com")
    openai_client = OpenAI()
    # model = "deepseek-chat"
    model = "gpt-4o-mini"
    # response = openai_client

    chat_completion = openai_client.chat.completions.create(
      model= model,
      messages=[{"role": "system", "content": query_analyzer_prompt.replace("{{category_list}}", str(category_lists))
               
                # You are a highly experienced legal expert. Your task is to analyze and solve a complex legal question using a systematic approach. Break down the scenario, identify the relevant legal principles, and structure your response as if you were preparing a professional opinion or advice for a client.

                # # Steps

                # 1. **Language**: Assume the query is written in Italian and pertains to Italian law.
                # 2. **Understanding**: Interpret the query with a focus on legal context and terminology.
                # 3. **Extraction**: Identify and extract specific legal elements and contextual information from the query.

                # # Output Format

                # Provide a structured JSON output containing the following fields:
                # - `specific_laws`: A list of specific laws mentioned in the query. If no law is mentioned with number and year then this should be empty. Each law should be represented as an object with:
                #   - `name`: The full name of the law (e.g., "R.D. March 16, 1942, No. 262").
                #   - `number`: The number of the law (e.g., "262").
                #   - `year`: The year the law was enacted (e.g., "1942") -`articlenumber`: If article number have been mentioned (e.g., "7" or "34") .
                # - `case_type`: The inferred case type based on the query Must be among "Civil Law", "Criminal Law" , "Labor Law".
                # - `context`: A summary of relevant signals from the query, including:
                #   - Key topics
                #   - Involved parties
                #   - Legal scenario - combination of the key topics in an expanded best query formation
                # - `noise`: Any irrelevant or rhetorical parts of the query (optional).
                # - thematic_classification: Identify the overarching theme of the query and classify the query into hierarchical primary categories and subcategories, adhering to legal taxonomies.
                #   when extracting thematic classifcation and combined_questions follow the following process:
                #        - Identify the Key Issues: Clearly state the main legal issues arising from the situation.
                #        - Research Legal Principles: Outline the applicable laws, precedents, or regulations relevant to each issue.
                #        - Evaluate Possible Actions: Describe the options available to the person involved, including any remedies, legal actions, or preventive measures.
                #        - Simulate Question Generation: Formulate key questions 5-10 that would allow to identify the key issues mentioned
                #        - Generate thematic classification for each question
                #        - combine all as a list and create thematic classification
                #        - all generated questions should be sent on the questions field

                #   This are the list of categories to select and create the categories from the following thematic categories:

                #   {{category_lists}}

                # # Examples

                # **Example 1:**

                # *Input:* "Quali sono le implicazioni legali della responsabilità civile per danni alla proprietà secondo il Codice delle assicurazioni?"

                # *Output:*
                # ```json
                # {
                #   "specific_laws": [
                #     {
                #       "name": "Codice delle assicurazioni",
                #       "number": "",
                #       "year": ""
                #     }
                #   ],
                #   "case_type": "Civil Law",
                #   "context": {
                #     "key_topics": ["responsabilità civile", "danni alla proprietà"],
                #     "involved_parties": [],
                #     "legal_scenario": "responsabilità civile per danni alla proprietà"
                #   },
                #   "noise": "",

                #   "thematic_classification": {
                #       "primary_category": ["Civil Law Agent (Civil Law)"],
                #       "secondary_category": ["Civil Liability", "Real Rights"],
                #       "tertiary_category": [
                #         "Contractual and extra-contractual liability",
                #         "Civil wrong, fault, fraud, criteria for attributing damages",
                #         "Liability of the manufacturer and for things in custody",
                #         "Liquidation of damages and compensation",
                #         "Typical contracts (sale, procurement, rental, mandate, surety, insurance)",
                #         "Property (purchase, protection, limits, expropriation for public utility)",
                #         "Real rights of guarantee (pledge, mortgage)",
                #         "Possession and detention (possessory protection, effects, adverse possession)"
                #       ]
                #     }
                # }
                # ```

                # # Notes

                # - The field `specific_laws` may contain empty strings for `number` and `year` if those details are not provided in the query.
                # - The `noise` field is optional and should only include content that is deemed irrelevant or rhetorical.

                # """.replace("{{category_lists}}", str(category_lists))
                },
                  {
                    "role": "system", "content": query
                  }

                ],
      response_format={
      "type": "json_object"
    },

    )
    result = json.loads(chat_completion.choices[0].message.content)
    print(result)
    # awadwd
    return result


def get_combined_result(query_result, questions):
    results = []
    print(type(questions))
    print(questions)
    collection = client.collections.get("National_articles_Test")
    filter_list = []
    # filter_list.append(Filter.by_property("tags").like("REGIO DECRETO 16 Marzo 1942, n. 262"))
    filter_list.append(Filter.by_property("category").like('"status": "in_force"'))
    if len(query_result["classification"]["case_type"]) > 0:
        filter_list.append(Filter.by_property("category").contains_any(query_result["classification"]["case_type"]))
    if len(query_result["classification"]["secondary_category"]) > 0:
        filter_list.append(Filter.by_property("category").contains_any(query_result["classification"]["secondary_category"]))
    if len(query_result["classification"]["tertiary_category"]) > 0:
        filter_list.append(Filter.by_property("category").contains_any(query_result["classification"]["tertiary_category"]))
    filters = Filter.all_of(filter_list)
    all_distance = []
    for q in questions["questions"]:
        # query_vector = op_client.embeddings.create(input = [text], model="text-embedding-3-small").data[0].embedding
        query_vector = embedding.embed_documents([q])[0] 
        
        one_result = collection.query.near_vector(
        near_vector=query_vector,
        filters=Filter.by_property("category").like('"status": "in_force"'),
        limit=1,
        return_metadata=MetadataQuery(distance=True)
        )
        
        for o in one_result.objects:
                print(o.metadata.distance)
                all_distance.append(o.metadata.distance)
            # if o.metadata.distance > 0.4:
                properties = o.properties
                properties["id"] = str(o.uuid)
                # result.append(r.properties)
                results.append(properties)
    print("getting combined result about to end")
    result = convert_to_dict(results)
    returned_data = structure_found_result(result)
    for index, r in enumerate(result):
        # print("working")
        # print(index)
        # refered_links = create_relationship_data(r["metadata"]["refered_articles"])
        # # print("one passed")
        # updated_all_links = create_relationship_data(r["metadata"]["update_articles"])
        
        # updated_articles = get_updates_of_article(r)
        # print("here")
        returned_data[index]["supporting_articles"] = []
        returned_data[index]["update_articles"] = []
        returned_data[index]["updated_articles"] = []

    return returned_data, all_distance

  
def search_by_vector(text):
    # print(text)
    extracted_result = extract_relevant_fields_from_query(text)
    # print("################################")
    # # print(extracted_result)
    
    extracted_field_result = []

    # if "laws" in extracted_result and len(extracted_result["laws"]) != 0:
    #     print("in law")
    #     extracted_field_result_1 = get_result_for_extracted_details({"laws": extracted_result["laws"] }, extracted_result["legal_scenario"] + "/n" + text)
    #     extracted_field_result.extend(extracted_field_result_1)
    #     print("done with that")

    if "specific_laws" in extracted_result and len(extracted_result["specific_laws"]) != 0:
        print("in specific law")
        extracted_field_result_2 = get_result_for_extracted_details({"specific_laws": extracted_result["specific_laws"]}, extracted_result["legal_scenario"]+ "/n" + text)
        extracted_field_result.extend(extracted_field_result_2)
        print("done with that")

    print("question generation")
    questions = get_query_analyzer_with_question(text)
    print("getting combined result started")
    query_result = get_query_analyzer(str(questions["questions"]))
    extracted_field_result_3, distance_for_contexts = get_combined_result(query_result, questions)
    # print(len(extracted_field_result_3))
    combined = list(zip(distance_for_contexts, extracted_field_result_3))
    # print(combined)
    # Sort the combined list based on the float values
    sorted_combined = sorted(combined, key=lambda x: x[0])
    
    # Unzip the sorted lists
    sorted_floats, sorted_jsons = zip(*sorted_combined)
    # print(sorted_floats)
    sorted_jsons = list(sorted_jsons)

    max_result = 20
    # print(sorted_jsons)
    if len(sorted_jsons) > max_result:
        extracted_field_result.extend(sorted_jsons[:max_result])
    else:
        extracted_field_result.extend(sorted_jsons)
    
    # extracted_field_result.extend(extracted_field_result_3)
    # print(len(extracted_field_result))
    # print(extracted_field_result)
    # for e in extracted_field_result:
        # print(e["id"])
    print(len(extracted_field_result))
    open_space = max_result - len(extracted_field_result) 
    print(open_space)



    if open_space < 0:
        open_space = 0
    print("finalizing everything")
    
    
    # print(extracted_field_result)
    
    # from weaviate.classes.init import Auth
    # import weaviate
    # weaviate_api_key = "lac9ab923c3bab9d9bf25bec0a425c8810178cbe2f6453ad6392757df74ba677e3b070a75"

    # wecolclient = weaviate.connect_to_local(
    #     host="127.0.0.1",  # Use a string to specify the host
    #     port=8080,
    #     # grpc_port=50051,
    #     auth_credentials=Auth.api_key(weaviate_api_key)
    #     # headers={
    #     #     "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]
    #     # }
    # )S

    # collection = wecolclient.collections.get("National_articles")
    # print(len(collection.query.fetch_object_by_id(uuid="1ae77335-c351-5dce-a5d5-8f1d9578c547",include_vector=True).vector["default"]))
    # fwfe
    nearVector = {
            "vector": embedding.embed_documents([text])[0] #collection.query.fetch_object_by_id(uuid="1ae77335-c351-5dce-a5d5-8f1d9578c547",include_vector=True).vector["default"] #embedding.embed_documents([text])[0]
            }
    # where_clause_list = [
    #     {
    #     "path":["category"],
    #     "operator": "Like",
    #     "valueString": '"status": "in_force"'
    # },]

    where_clause_list = [] 
               
    where_clause_list.append(Filter.by_property("category").like('"status": "in_force"')) #.equal("Double Jeopardy!")
    # where_clause_list.append(Filter.by_property("category"). .like('"update_name": "21"'))

    filters = Filter.all_of(where_clause_list)
           
            
    #     {
    #     "path":["tag"],
    #     "operator": "Like",
    #     "valueString": '"law_name": "REGIO DECRETO 2 Dicembre 1866,  n. 3352"'
    # },
    # {
    #     "path":["metadata"],
    #     "operator": "Like",
    #     "valueString": '"update_name": "21"'
    # },
    # ]

    where_filter = {
                    "operator": "And",
                    "operands": where_clause_list
                    }  

    # result = (
    #                     client.query
    #                     .get("Test_Articles", ["content", "date_to", "entry_to_force", "metadata", "tag"])
    #                     .with_additional("id")
    #                     .with_where(where_filter)
    #                     .with_near_vector(nearVector)
    #                     .do()
    # )
    # result = result["data"]["Get"]["Test_Articles"]
    # result
    print(filters)
    # print(len(nearVector))
    # result = (
    #                 client.query
    #                 .get("National_articles", ["content", "date_to", "entry_to_force", "metadata", "tags", "category"])
    #                 .with_additional(["distance","id"])
    #                 .with_where(where_filter)
    #                 .with_near_vector(nearVector)
    #                 .with_limit(10)
    #                 .do()
    # )

    

    collection = client.collections.get("National_articles")

   

    # print(filters)
    if open_space > 0:
        object_result = collection.query.near_vector(near_vector=nearVector["vector"] , filters=filters , limit=open_space, return_metadata=MetadataQuery(distance=True)) #, filters=filters
        print(len(object_result.objects))
        result = []

        for r in object_result.objects:
            print(r.metadata.distance)
            properties = r.properties
            properties["id"] = str(r.uuid)
            result.append(r.properties)
            # object_result

        # result = result.objects #result["data"]["Get"]["National_articles"]
        # print(result)
        # for r in result:

            # print(r["_additional"])
        result = convert_to_dict(result)
        returned_data = structure_found_result(result)
        for index, r in enumerate(result):
            # print("working")
            # print(index)
            refered_links = create_relationship_data(r["metadata"]["refered_articles"])
            # print("one passed")
            updated_all_links = create_relationship_data(r["metadata"]["update_articles"])
            
            updated_articles = get_updates_of_article(r)
            # print("here")
            returned_data[index]["supporting_articles"] = refered_links
            returned_data[index]["update_articles"] = updated_all_links
            returned_data[index]["updated_articles"] = updated_articles
            # print("done")
        # print(extracted_field_result)
        print("combining")
        extracted_field_result.extend(returned_data)
        print(len(extracted_field_result))
        print("listing them here")
        # for e in extracted_field_result:
        #     print(e["id"])
    extracted_field_result = list({item['id']: item for item in extracted_field_result}.values())
    # print(len(returned_data))
    return extracted_field_result
# def search_by_vector(text, page, size):
#     extracted_field_result = []
#     nearVector = {
#         "vector": embedding.embed_documents([text])[0]
#     }

#     where_clause_list = []
#     where_clause_list.append(Filter.by_property("category").like('"status": "in_force"'))

#     filters = Filter.all_of(where_clause_list)
#     where_filter = {
#         "operator": "And",
#         "operands": where_clause_list
#     }

#     print(filters)
#     collection = client.collections.get("National_articles")
#     print(filters)

#     object_result = collection.query.near_vector(near_vector=nearVector["vector"], filters=filters)
#     print(object_result)
#     result = []

#     for r in object_result.objects:
#         properties = r.properties
#         properties["id"] = str(r.uuid)
#         result.append(r.properties)

#     result = convert_to_dict(result)
#     returned_data = structure_found_result(result)
#     for index, r in enumerate(result):
#         refered_links = create_relationship_data(r["metadata"]["refered_articles"])
#         updated_all_links = create_relationship_data(r["metadata"]["update_articles"])
#         updated_articles = get_updates_of_article(r)
#         returned_data[index]["supporting_articles"] = refered_links
#         returned_data[index]["update_articles"] = updated_all_links
#         returned_data[index]["updated_articles"] = updated_articles

#     extracted_field_result.extend(returned_data)
#     extracted_field_result = list({item['id']: item for item in extracted_field_result}.values())

#     total_contexts = len(extracted_field_result)

#     start_index = (page - 1) * size
#     end_index = start_index + size
#     paginated_results = extracted_field_result[start_index:end_index]

#     response = {
#         "totalContexts": total_contexts,
#         "page": page,
#         "size": size,
#         "contexts": paginated_results
#     }

#     return response

def get_updates_of_article(article):

    law_name = article["tags"]["law_name"]
    update_name = article["metadata"]["update_name"]

    where_clause_list = [{
        "path":["tags"],
        "operator": "Like",
        "valueString": f'"law_name": "{law_name}"' #"REGIO DECRETO 2 Dicembre 1866,  n. 3352"'
    },
    {
        "path":["metadata"],
        "operator": "Like",
        "valueString": f'"update_name": {update_name}'
    },
    {
        "path": ["id"],
        "operator": "NotEqual",
        "valueString": article["id"]
    }
    ]

    where_filter = {
                    "operator": "And",
                    "operands": where_clause_list
                    }  
    where_clause_list = []
    where_clause_list.append(Filter.by_property("tags").like(f'"law_name": "{law_name}"')) #.equal("Double Jeopardy!")
    where_clause_list.append(Filter.by_property("metadata").like(f'"update_name": {update_name}')) 
    where_clause_list.append(Filter.by_id().not_equal(article["id"])) # .by_property("id").not_equal(article["id"])) 

    filters = Filter.all_of(where_clause_list)

    # result = (
    #                     client.query
    #                     .get("National_articles", ["content", "date_to", "entry_to_force", "metadata", "tags"])
    #                     .with_additional("id")
    #                     .with_where(where_filter)
    #                     .with_sort({'path': ['entry_to_force'], 'order': 'asc' })
                        
    #                     # .with_near_vector(nearVector)
    #                     .do()
    # )

    collection = client.collections.get("National_articles")

    # collection.
    object_result = collection.query.fetch_objects(

                # where=where_filter,
                filters=filters,
                # sort={'path': ['entry_to_force'], 'order': 'asc' }
                sort=Sort.by_property(name="entry_to_force", ascending=True),
            )

    result = []

    for r in object_result.objects:
        properties = r.properties
        properties["id"] = str(r.uuid)
        result.append(r.properties)

    # result = result["data"]["Get"]["National_articles"]
    result = convert_to_dict(result)
    returned_data = structure_found_result(result)

    return returned_data

def create_relationship_data(result):
    
    if len(result) == 0:
        return []
    # refered_ids = result[0]["metadata"]["refered_articles"]
    # print(result)
    # refered_ids = result[0]["metadata"]["refered_articles"]
    # refered_ids = ["6720baa4-f032-5d17-b354-947ffeff2e2c","a3d84a58-bbad-5340-841a-69721da0d7a4"]
    where_filter = {
        "path":["id"],
        "operator": "ContainsAny",
        "valueStringArray": result
    }

    where_clause_list = []
    where_clause_list.append(Filter.by_id().contains_any(result)) #.equal("Double Jeopardy!") .by_property("id")
    # where_clause_list.append(Filter.by_property("metadata").like(f'"update_name": {update_name}')) 
    # where_clause_list.append(Filter.by_property("id").notequal(article["id"])) 

    filters = Filter.all_of(where_clause_list)

    # further_result = (client.query.get("National_articles", ["content", "date_to", "entry_to_force", "metadata", "tags"])
    #             .with_additional("id")
    #             .with_where(where_filter)
    #             # .with_limit(int(page_size))
    #             # .with_offset((int(page) - 1)*int(page_size))
    #             .do())

    collection = client.collections.get("National_articles")

    # collection.
    object_result = collection.query.fetch_objects(

                # where=where_filter,
                filters=filters,
                # sort={'path': ['entry_to_force'], 'order': 'asc' }
                sort=Sort.by_property(name="entry_to_force", ascending=True),
            )

    further_result = []

    for r in object_result.objects:
        properties = r.properties
        properties["id"] = str(r.uuid)
        further_result.append(r.properties)

    # further_result = further_result["data"]["Get"]["National_articles"]
    further_result = convert_to_dict(further_result)
    return structure_found_result(further_result)

def structure_found_result(result, main=False):
    final_result = []
    for r in result:
        # print(r)
        metadata = r["metadata"]
        tag = r["tags"]
        one_result_template = {

            "id": r["id"],
            "article_name": metadata["update_name"] + "," + tag["law_name"],  
            "article_detail": r["content"],
            "date-from": str(r["entry_to_force"]).split("T")[0] if r["entry_to_force"] is not None else None,
            "date-to": str(r["date_to"]).split("T")[0] if  r["date_to"] is not None else None,
        }

        # if main:
        #     one_result_template["supporting_articles"] = [
        #         {"id": "123456", "name": "supporting 1"},
        #         {"id": "123456", "name": "supporting 2"},
        #         {"id": "123456", "name": "supporting 4"}
        #     ],
        #     one_result_template["update_articles"] =  [
        #         {"id": "123456", "name": "updating 1"},
        #         {"id": "123456", "name": "updating 2"},
        #         {"id": "123456", "name": "updating 3"}
            # ]
        final_result.append(one_result_template)
    return final_result

def convert_to_dict(result):
    cleaned_result= result.copy()
    for index, r in enumerate(result):
        # print(r)
        for fields in r:
            if fields in ["metadata", "tags"]:
                # print(r[fields])
                # print(json.loads(r[fields]))
                cleaned_result[index][fields] = json.loads(r[fields])

    return cleaned_result

def create_relationship_data_past(result):
    # result = context_data({'context': 'hello'})  
    print("started")
    result = result["data"]["Get"]["DocumentTemplate"]
    final_query_result = []
    one_result_template = {
        "id": "",
        "article_name": "",
        "article_detail": "",
        "date-from": "2015-07-01",
        "date-to": "2017-03-01",
        "supporting_articles": [
            {"id": "123456", "name": "supporting 1"},
            {"id": "123456", "name": "supporting 2"},
            {"id": "123456", "name": "supporting 4"}
        ],
        "update_articles": [
            {"id": "123456", "name": "updating 1"},
            {"id": "123456", "name": "updating 2"},
            {"id": "123456", "name": "updating 3"}
        ]
    }
    print("middle")
    for r in result:
        # print("1")
        one_result = one_result_template.copy()
        # print("2")
        one_result["id"] = r["id"]
        # print("3")
        one_result["article_name"] = r["text"]
        # print("4")
        one_result["article_detail"] = r["detail"]
        # print("5")
        final_query_result.append(one_result)
    print("finished")
    return final_query_result


def get_all_template_data(classname):
    try:

        obj = client.query.get(classname,["text","detail","_additional {id}",]).do()
        
        collection = client.collections.get(classname)

        # collection.
        object_result = collection.query.fetch_objects(

                    # where=where_filter,
                    # filters=filters,
                    # sort={'path': ['entry_to_force'], 'order': 'asc' }
                    # sort=Sort.by_property(name="entry_to_force", ascending=True),
                )
        # print(obj)

        further_result = []

        for r in object_result.objects:
            properties = r.properties
            properties["_additional"] =  { "id":str(r.uuid)}
            further_result.append(r.properties)
        
        if further_result:
            return further_result
        else:
            return []
    except Exception as e:
        raise "Error have Occurred"
# Endpoint to update data by id
def update_specific_template_data(classname, id: str, data):
    try:
        print(data)
        update_data = {}
        collection = client.collections.get(classname)
        if "detail" in data:
            update_data["detail"] = data["detail"]
        if "text" in data:
            update_data["text"] = data["text"]
            vector = embedding.embed_documents([data["text"]])[0]
            # client.data_object.update(uuid=id , class_name=classname, data_object=update_data, vector=vector)
            collection.data.update(uuid=id , properties=update_data, vector=vector)
        else:
            # client.data_object.update(uuid=id , class_name=classname, data_object=update_data)
            collection.data.update(uuid=id , properties=update_data)
        return {"message": "Data updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# def compare_dataframe_and_update_db(db, original_df, changed_df):
#     try:
#         print(data)
#         update_data = {
#             "detail": data.detail,
#         }
#         if data.update_vector:
#             update_data["text"] = data.text
#             vector = embedding.embed_documents([data.text])[0]
#             client.data_object.update(uuid=id , class_name=class_name, data_object=update_data, vector=vector)
#         else:
#             client.data_object.update(uuid=id , class_name=class_name, data_object=update_data)
#         return {"message": "Data updated successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=1111, lifespan="on", reload=True)
    




# where_clause_list = [{
#     "path":["tag"],
#     "operator": "Like",
#     "valueString": '"law_name": "REGIO DECRETO 2 Dicembre 1866,  n. 3352"'
# },
# {
#     "path":["metadata"],
#     "operator": "Like",
#     "valueString": '"update_name": "21"'
# },
# ]

# where_filter = {
#                 "operator": "And",
#                 "operands": where_clause_list
#                 }  

# result = (
#                     client.query
#                     .get("Test_Articles", ["content", "date_to", "entry_to_force", "metadata", "tag"])
#                     .with_additional("id")
#                     .with_where(where_filter)
#                     .with_near_vector(nearVector)
#                     .do()
# )
# result = result["data"]["Get"]["Test_Articles"]
# result

# def search_by_vector(text):
#     nearVector = {
#             "vector": op_client.embeddings.create(input = [text], model="text-embedding-3-small").data[0].embedding
#             }
    
#     result = (
#                     client.query
#                     .get("Sample_article_test", ["content", "date_to", "entry_to_force", "metadata", "tag"])
#                     .with_additional("id")
#                     .with_near_vector(nearVector)
#                     .do()
#     )
#     result = result["data"]["Get"]["Sample_article_test"]
#     result = convert_to_dict(result)
#     returned_data = structure_found_result(result)
#     for index, r in enumerate(result):
#         refered_links = create_relationship_data(r["metadata"]["refered_links"])
#         updated_all_links = create_relationship_data(r["metadata"]["updated_all_links"])
#         returned_data[index]["supporting_articles"] = refered_links
#         returned_data[index]["update_articles"] = updated_all_links

#     return returned_data

# def create_relationship_data(result):
#     refered_ids = cleaned_result[0]["metadata"]["refered_links"]
#     refered_ids = ["6720baa4-f032-5d17-b354-947ffeff2e2c","a3d84a58-bbad-5340-841a-69721da0d7a4"]
#     where_filter = {
#         "path":["id"],
#         "operator": "ContainsAny",
#         "valueStringArray": refered_ids
#     }

#     further_result = (client.query.get("Sample_article_test", ["content", "date_to", "entry_to_force", "metadata", "tag"])
#                 .with_additional("id")
#                 .with_where(where_filter)
#                 # .with_limit(int(page_size))
#                 # .with_offset((int(page) - 1)*int(page_size))
#                 .do())
#     further_result = further_result["data"]["Get"]["Sample_article_test"]
#     further_result = convert_to_dict(further_result)
#     return structure_found_result(further_result)

# def structure_found_result(result, main=False):
#     final_result = []
#     for r in result:
#         # print(r)
#         metadata = r["metadata"]
#         tag = r["tag"]
#         one_result_template = {

#             "id": r["_additional"]["id"],
#             "article_name": metadata["article_number"],  
#             "article_detail": r["content"],
#             "date-from": r["entry_to_force"],
#             "date-to": r["date_to"],
#         }

#         # if main:
#         #     one_result_template["supporting_articles"] = [
#         #         {"id": "123456", "name": "supporting 1"},
#         #         {"id": "123456", "name": "supporting 2"},
#         #         {"id": "123456", "name": "supporting 4"}
#         #     ],
#         #     one_result_template["update_articles"] =  [
#         #         {"id": "123456", "name": "updating 1"},
#         #         {"id": "123456", "name": "updating 2"},
#         #         {"id": "123456", "name": "updating 3"}
#             # ]
#         final_result.append(one_result_template)
#     return final_result

# def convert_to_dict(result):
#     cleaned_result= result.copy()
#     for index, r in enumerate(result):
#         # print(r)
#         for fields in r:
#             if fields in ["metadata", "tag"]:
#                 # print(r[fields])
#                 # print(json.loads(r[fields]))
#                 cleaned_result[index][fields] = json.loads(r[fields])

#     return cleaned_result