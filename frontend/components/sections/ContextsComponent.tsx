import { ContextState, useContextsContext } from "@/hooks/useContextsContext";
import { useFeedbackContext } from "@/hooks/useFeedbackContext";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "../ui/input";
import { Loader2, X } from "lucide-react";
import { AppContextData } from "@/hooks/useAppContext";
import { toast } from "react-toastify";

// interface ContextsComponentProps {
//   searchMessage: string | null; 
// }
// { searchMessage }
{/* <ContextsComponentProps> = () */}

interface ContextsComponentProps {
  data: AppContextData;
}

const filterableFeatures = [
  { value: "article_name", label: "Article Name" },
];


const filterableDatabases = [
  {value:"National_articles", label:"National" },
  { value: "Case", label: "Case" },

];


export const ContextsComponent:React.FC<ContextsComponentProps> =({data: appData}) => {
  const { state, data, actions } = useContextsContext();
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showSupportingArticles, setShowSupportingArticles] = useState(false);
  const [showUpdatingArticles, setShowUpdatingArticles] = useState(false);
  const [selectedSupportingArticle, setSelectedSupportingArticle] = useState(null);
  const [selectedUpdatingArticle, setSelectedUpdatingArticle] = useState(null);
  const [filter, setFilters] = useState<Array<{ feature: string; value: string }>>([]);
  const detailViewKey = selectedArticle ? selectedArticle.id : null;

  const {filterQuery,filterFiles,setfilterFiles,setfilterQuery,listOfArticles,onCancel,onRatingChange,setListOfArticles,setRatings,ratings}= useFeedbackContext()


  useEffect(() => {
    if (data.contexts && data.contexts.length > 0) {
      setListOfArticles(data.contexts);
    }
  }, [data.contexts, setListOfArticles]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data.contexts || data.contexts.length === 0) return;
  
      if (e.key === "ArrowDown") {
        setSelectedIndex((prevIndex) => {
          const nextIndex = prevIndex === null ? 0 : Math.min(prevIndex + 1, data.contexts.length - 1);
          articleRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          return nextIndex;
        });
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prevIndex) => {
          const nextIndex = prevIndex === null ? 0 : Math.max(prevIndex - 1, 0);
          articleRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
          return nextIndex;
        });
      } else if (e.key === "Enter" && selectedIndex !== null) {
        setSelectedArticle(data.contexts[selectedIndex]);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, data.contexts]);
  
   
    
  useEffect(()=>{
    setRatings(ratings)
    
    }),[]
    
  const handleCloseArticle = () => {
    setSelectedArticle(null);
    setShowSupportingArticles(false);
    setShowUpdatingArticles(false);
    setSelectedSupportingArticle(null);
    setSelectedUpdatingArticle(null);
  };
  

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const articleRefs = useRef<Array<HTMLDivElement | null>>([]);

 
  // const handleSearch = () => {
  //   setIsSearchClicked(true);
  //   console.log('Search triggered with query:', searchQuery);
  //   actions.fetch.contexts(searchQuery);
  //   console.log("***********************************************",actions.fetch.contexts(searchQuery));
  // };
  
  // const handleSearch = () => {
  //   if (!searchQuery.trim()) {
  //     console.log("Please enter a search query.");
  //     return;
  //   }
  //   setIsSearchClicked(true);
  //   console.log("Search triggered with query333333:", searchQuery);
  //   actions.fetch.contexts(searchQuery); 
  // };
  
  // useEffect(() => {
  //   actions.fetch.contexts(searchQuery);
  // }, []);

  const handleRatingChange = (articleId: string, rating: string) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [articleId]: rating,
    }));
  };
  
  interface FilterQuery {
    value: string;
  }
  
  const handleFilterQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setfilterQuery((prev) => ({ ...prev, value: e.target.value }));
  };
  
  const handleFilterFilesChange = (value: string) => {
    setfilterFiles((prev) => ({ ...prev, feature: value }));
  };


const applyFilters = () => {
  console.log("Applying filters");
  const filterObject: Record<string, string> = {};

  if (filterQuery.value) {
    filterObject["query"] = filterQuery.value;
  }

  if (filterFiles.feature) {
    filterObject["database"] = filterFiles.feature || "National";
  } else {
    filterObject["database"] = "National"; 
  }

  filterObject["model"] = appData.model;

  if (!filterQuery.value && !filterFiles.feature) {
    toast.warning("Please submit a search query and file filter before applying filters.");
    console.log("No filters applied: Both filterQuery and filterFiles are empty.");
    return;
  }

  console.log("Generated filter object:", filterObject);

  actions.submit.applyFilter(filterObject);
};

  // const applyFilters = () => {
  //   console.log("Applying filters");
  //   const filterObject: Record<string, string> = {};
  
  //   if (filterQuery.value) {
  //     filterObject["query"] = filterQuery.value;
  //   }
  
  //   if (filterFiles.feature) {
  //     filterObject["database"] = filterFiles.feature || "National";
  //   } else {
  //     filterObject["database"] = "National"; // Default value
  //   }
  
  //   filterObject["model"] = appData.model;
  
  //   console.log("Generated filter object:", filterObject);
  
  //   if (Object.keys(filterObject).length > 0) {
  //     actions.submit.applyFilter(filterObject);
  //   } else {
  //     console.log("No filters applied: Both filterQuery and filterFiles are empty.");
  //   }
  // };
  

const renderLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="mr-2 h-16 w-16 animate-spin" />
  </div>
);


const renderContexts = () => (
    <div className="flex justify-center gap-3 h-[80vh]">
      <div className="hidden md:flex md:w-[45vw]">
        <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row justify-center gap-4 p-4 ml-2 items-center">
  <div className="flex flex-col items-center">
    <Select value={filterFiles.feature} onValueChange={handleFilterFilesChange}>
      <SelectTrigger className="w-36 h-[40px] border-gray-400">
        <SelectValue placeholder="Select File to filter" className="text-sm">
          {filterFiles.feature ? (
            filterableDatabases.find((feature) => feature.value === filterFiles.feature)?.label
          ) : (
            "Select File to filter"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-36">
        {filterableDatabases.map((feature) => (
          <SelectItem key={feature.value} value={feature.value}>
            {feature.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <label className="flex items-center gap-2 border-2 p-2 w-full h-[40px] rounded-full border-gray-200">
    <input 
      className="grow w-full focus:outline-none placeholder-black placeholder:text-sm text-sm ml-2" 
      placeholder="Search for contexts..."
      value={filterQuery.value}
      onChange={handleFilterQueryChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          applyFilters();
        }
      }}
    />
  </label>
</div>


          <div className="grid grid-cols-1 gap-8 w-full ml-2">
{data.contexts.map((context) => (
  <div 
  key={context.id} 
  onClick={() => setSelectedArticle(context)}
  className="cursor-pointer group 
            hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 
            bg-bg-verba hover:bg-button-verba
            rounded-xl p-4 
            shadow-sm 
            border-2 border-transparent
            hover:border-button-hover-verba">
  <div className="flex justify-between items-center mt-2">
        <h3 className="font-medium text-lg group-hover:text-text-alt-verba-button">
          {context.article_name}
        </h3>
  </div>
  <div className="flex flex-row  justify-between mt-2">
  {context['date-from'] && (
  <span className="text-sm text-text-alt-verba group-hover:text-text-verba-button">
    {new Date(context['date-from']).toISOString().split('T')[0]}
  </span>
)}

    <div>
    <div className="flex space-x-2">
  {["Relevant", "Semi-relevant", "Irrelevant"].map((rating, index) => (
    <div
      key={rating}
      className="flex items-center space-x-2 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        handleRatingChange(context.id, rating);
      }}
    >
      <input
        type="radio"
        name={`rating-${context.id}`}
        id={`rating-${context.id}-${rating}`}
        checked={ratings[context.id] === rating}
        onChange={() => handleRatingChange(context.id, rating)}
        className="hidden"
      />
      <label htmlFor={`rating-${context.id}-${rating}`} className="flex items-center">
        <svg
          className={`w-8 h-8 ${
            ratings[context.id] === rating ? "fill-gray-500 border-gray-500"
            : "fill-white border-gray-500 stroke-gray-500"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 22 20"
          aria-hidden="true"
        >
          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
        </svg>
      </label>
      <span>{rating}</span>
    </div>
  ))}
</div>

    </div>
  </div>
  </div>
  ))}
   {data.contexts && data.contexts.length > 0 && (
  <div className="mt-4 flex justify-between items-center">
    <Button onClick={() => actions.click.previousPage()} disabled={data.currentPage === 0}>
      Previous
    </Button>

    <span>
      Page {data.currentPage + 1} of {Math.ceil(data.totalContexts / 10)}
    </span>

    <Button
      onClick={() => actions.click.nextPage()}
      disabled={(data.currentPage + 1) * 10 >= data.totalContexts}
    >
      Next
    </Button>
  </div>
)}

</div>


        </div>
      </div>

      {selectedArticle && (
        <div className="md:w-[55vw] w-full flex" key={detailViewKey}>
          <div className="flex flex-col gap-2 w-full">
            <div className="bg-bg-alt-verba rounded-2xl flex flex-col p-6 h-full w-full overflow-y-auto overflow-x-hidden relative">
              <button 
                onClick={handleCloseArticle}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-button-hover-verba transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-text-alt-verba" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-verba mb-3">
              {selectedArticle.article_name}
            </h2>
            <div className="flex gap-4 text-sm">
                  
                  {selectedArticle['date-from'] && (
                    <div className="flex flex-row gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    </svg>
                    <span>From: {selectedArticle['date-from']}</span>
                    </div>
                  )}
              
                  
                  {selectedArticle['date-to'] && (
                    <div className="flex flex-row gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    </svg>
                    <span>To: {selectedArticle['date-to']}</span>
                    </div>
                  )}
              
            </div>
          </div>

          
          <div className="bg-bg-verba rounded-lg p-6 mb-6">
          <div className="prose max-w-none">
            <p className="text-text-verba whitespace-pre-line">
              {selectedArticle.article_detail.split('((').map((part, index) => {
                const [highlight, rest] = part.split('))');
                return index === 0 ? part : (
                  <>
                    <span className="font-bold bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                      {highlight}
                    </span>
                    {rest}
                  </>
                );
              })}
            </p>
          </div>
          <div>
            
          </div>
          </div>

          <div className="flex gap-4 justify-center mt-auto">
            <button 
              onClick={() => setShowSupportingArticles(true)}
              className="btn px-6 py-3 rounded-xl flex items-center gap-2 bg-button-verba hover:bg-button-hover-verba text-text-alt-verba-button hover:text-text-verba-button transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Supporting Articles ({selectedArticle.supporting_articles.length})
            </button>
            <button 
              onClick={() => setShowUpdatingArticles(true)}
              className="btn px-6 py-3 rounded-xl flex items-center gap-2 bg-button-verba hover:bg-button-hover-verba text-text-alt-verba-button hover:text-text-verba-button transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Updating Articles ({selectedArticle.updated_articles.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{/* {showSupportingArticles && (
  <div className="modal modal-open">
    <div className="modal-box">
      <h3 className="font-bold text-lg mb-4">Supporting Articles</h3>
      <div className="flex flex-col gap-2">
        {selectedArticle.supporting_articles.map(article => (
          <div key={article.id} className="p-2 bg-bg-verba rounded-lg">
            {article.name}
          </div>
        ))}
      </div>
      <div className="modal-action">
        <button 
          onClick={() => setShowSupportingArticles(false)}
          className="btn"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)} */}

{showSupportingArticles && (
  // <div className="modal modal-open">
  //   <div className="modal-box max-w-4xl bg-bg-alt-verba p-0 rounded-2xl shadow-2xl">
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSupportingArticles(false)} />
    <div className="modal-box max-w-4xl bg-white p-0 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
      <div className="flex h-[80vh]">
        {/* Articles List */}
        <div className="w-1/2 border-r border-gray-200 p-6 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Supporting Articles</h3>
          </div>
          <div className="grid gap-3 overflow-y-auto h-[calc(100%-6rem)]">
            {selectedArticle.supporting_articles.map(article => (
              <div 
                key={article.id} 
                onClick={() => setSelectedSupportingArticle(article)}
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200
                  ${selectedSupportingArticle?.id === article.id 
                    ? 'bg-button-verba text-text-alt-verba-button' 
                    : 'bg-bg-verba hover:bg-button-hover-verba'}`}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{article.article_name}</h4>
                  
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 p-6 bg-white">
          {selectedSupportingArticle ? (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedSupportingArticle.article_name}</h2>
              {selectedSupportingArticle['date-from'] && (
                    <div className="flex flex-row gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    </svg>
                    <span>From: {selectedSupportingArticle['date-from']}</span>
                    </div>
                  )}
                {selectedSupportingArticle['date-to'] && (
                    <div className="flex flex-row gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    </svg>
                    <span>To: {selectedSupportingArticle['date-to']}</span>
                    </div>
                  )}
              <div className="bg-gray-50 rounded-xl p-6 flex-grow overflow-y-auto">
                <div className="prose max-w-none text-gray-800">
                  <p className="text-text-verba whitespace-pre-line">
                  {selectedSupportingArticle.article_detail.split('((').map((part, index) => {
                const [highlight, rest] = part.split('))');
                return index === 0 ? part : (
                  <>
                    <span className="font-bold bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                      {highlight}
                    </span>
                    {rest}
                  </>
                );
              })}
                  </p>
                  
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an article to view details
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-bg-verba flex justify-end">
        <button 
          onClick={() => {
            setShowSupportingArticles(false);
            setSelectedSupportingArticle(null);
          }}
          className="btn px-6 py-2 rounded-xl bg-button-verba hover:bg-button-hover-verba text-text-alt-verba-button"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

{showUpdatingArticles && (
   <div className="fixed inset-0 z-50 flex items-center justify-center">
   <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUpdatingArticles(false)} />
   <div className="modal-box max-w-4xl bg-white p-0 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
     <div className="flex h-[80vh]">
       {/* Articles List */}
       <div className="w-1/2 border-r border-gray-200 p-6 bg-white">
         <div className="flex items-center gap-3 mb-6">
           <h3 className="text-xl font-bold text-gray-900">Updating Articles</h3>
         </div>
         
          <div className="grid gap-3 overflow-y-auto h-[calc(100%-6rem)]">
            {selectedArticle.updated_articles.map(article => (
              <div 
                key={article.id} 
                onClick={() => setSelectedUpdatingArticle(article)}
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200
                  ${selectedUpdatingArticle?.id === article.id 
                    ? 'bg-button-verba text-text-alt-verba-button' 
                    : 'bg-bg-verba hover:bg-button-hover-verba'}`}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{article.article_name}</h4>
                  {/* <p className="text-sm text-text-alt-verba line-clamp-2">{article.summary}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 p-6">
          {selectedUpdatingArticle ? (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4">{selectedUpdatingArticle.article_name}</h2>
              {selectedUpdatingArticle['date-from'] && (
                    <div className="flex flex-row gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    </svg>
                    <span>From: {selectedUpdatingArticle['date-from']}</span>
                    </div>
                  )}
              
              {selectedUpdatingArticle['date-to'] && (
                    <div className="flex flex-row gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                    </svg>
                    <span>To: {selectedUpdatingArticle['date-to']}</span>
                    </div>
                  )}
              
              <div className="bg-bg-verba rounded-xl p-6 flex-grow overflow-y-auto">
                <div className="prose max-w-none">
                  
                  <p className="text-text-verba whitespace-pre-line">
                    {/* {selectedSupportingArticle.article_detail} */}
                  {selectedUpdatingArticle.article_detail.split('((').map((part, index) => {
                const [highlight, rest] = part.split('))');
                return index === 0 ? part : (
                  <>
                    <span className="font-bold bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                      {highlight}
                    </span>
                    {rest}
                  </>
                );
              })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-alt-verba">
              Select an article to view details
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-bg-verba flex justify-end">
        <button 
          onClick={() => {
            setShowUpdatingArticles(false);
            setSelectedUpdatingArticle(null);
          }}
          className="btn px-6 py-2 rounded-xl bg-button-verba hover:bg-button-hover-verba text-text-alt-verba-button"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );

  const render = () => {
    if (data.contexts && data.contexts.length > 0) {
      return renderContexts();
    }
    switch (state.contextState) {
      case ContextState.Idle:
      case ContextState.FetchingContexts:
        return renderLoader();
      case ContextState.DisplayingContextsTable:
        return renderContexts();
      default:
        return renderLoader(); 
    }
  };
  

  return render();

};

export default ContextsComponent;
