// ContextsComponent.tsx
import { ContextState, useContextsContext } from "@/hooks/useContextsContext";
import { useFeedbackContext } from "@/hooks/useFeedbackContext";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "../ui/input";
import { Loader2, X } from "lucide-react";
import { AppContextData } from "@/hooks/useAppContext";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import FeedbackForm from "../forms/FeedbackForm"; // Import the FeedbackForm component


interface ContextsComponentProps {
    data: AppContextData;
}

const filterableFeatures = [
    { value: "article_name", label: "Article Name" },
];

const filterableDatabases = [
    { value: "National_articles", label: "National" },
    { value: "Regional_articles", label: "Regional" },
    { value: "previous_rulings", label: "Case" },
    { value: "EU_AI_ACT", label: "EU AI ACT" },
];

const filterableRegion = [
    { value: "ABRUZZO", label: "Abruzzo" },
    { value: "BASILICATE", label: "Basilicata" },
    { value: "BOLZANO", label: "Bolzano" },
    { value: "CALABRIA", label: "Calabria" },
    { value: "CAMPANIA", label: "Campania" },
    { value: "EMILIA-ROMAGNA", label: "Emilia-Romagna" },
    { value: "FRIULI-VENEZIA GIULIA", label: "Friuli-Venezia Giulia" },
    { value: "Lazio", label: "Lazio" },
    { value: "LIGURIA", label: "Liguria" },
    { value: "LOMBARDY", label: "Lombardy" },
    { value: "MARCHE", label: "Marche" },
    { value: "MOLISE", label: "MOLISE" },
    { value: "PIEDMONT", label: "Piedmont" },
    { value: "PUGLIA", label: "Puglia" },
    { value: "SARDINIA", label: "Sardinia" },
    { value: "SICILY", label: "Sicily" },
    { value: "TRENTO(PROV)", label: "Trento (Prov)" },
    { value: "TRENTINO ALTO ADIGE", label: "Trentino Alto Adige" },
    { value: "TUSCANY", label: "Tuscany" },
    { value: "UMBRIA", label: "Umbria" },
    { value: "VALLE D'AOSTA", label: "Valle d'Aosta" },
    { value: "VENETO", label: "Veneto" },
    {value: /Nan/, label:"All" },
];

const ContextsComponent = ({ data: appData, setSelectedArticle }) => {

    const parseJSONSafely = (jsonString) => {
        try {
            if (!jsonString) {
                return {}; // Or return a default object/value
            }

            // Replace NaN with null (or whatever default value makes sense in context)
            const sanitizedString = jsonString.replace(/NaN/g, "null");

            return JSON.parse(sanitizedString);
        } catch (error) {
            console.error("Error parsing JSON:", error, "for JSON:", jsonString);
            return {}; // Or return a default object/value
        }
    };

    const { state, data, actions } = useContextsContext();
    const [isSearchClicked, setIsSearchClicked] = useState(false);
    const [selectedArticle, setSelectedArticleInternal] = useState(null);
    const [showSupportingArticles, setShowSupportingArticles] = useState(false);
    const [showUpdatingArticles, setShowUpdatingArticles] = useState(false);
    const [selectedSupportingArticle, setSelectedSupportingArticle] = useState(null);
    const [selectedUpdatingArticle, setSelectedUpdatingArticle] = useState(null);
    const [lawPageUrl, setLawPageUrl] = useState<string | null>(null);
    const [showLawPage, setShowLawPage] = useState(false);
    const [filter, setFilters] = useState<Array<{ feature: string; value: string }>>([]);
    const detailViewKey = selectedArticle ? selectedArticle.id : null;

    const { filterQuery, filterFiles, setfilterFiles, setfilterQuery, listOfArticles, onCancel, onRatingChange, setListOfArticles, setRatings, ratings, selectedUser } = useFeedbackContext()
        const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

    useEffect(() => {
        if (data.contexts) {
            const initialRatings = data.contexts.reduce((acc, article) => {
                acc[article.id] = ratings[article.id] || 'No Issue Present';
                return acc;
            }, {});

            const ratingsAreDifferent = Object.keys(initialRatings).length !== Object.keys(ratings).length || Object.keys(initialRatings).some(key => initialRatings[key] !== ratings[key]);

            if (ratingsAreDifferent) {
                setRatings(initialRatings);
            }
        }
    }, [data.contexts, ratings]);

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
                // setSelectedArticleInternal(data.contexts[selectedIndex]); removed so it will not open the page again
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, data.contexts]);

    const handleCloseArticle = () => {
        setSelectedArticleInternal(null);
        setShowSupportingArticles(false);
        setShowUpdatingArticles(false);
        setSelectedUpdatingArticle(null);
        setLawPageUrl(null);
        setShowLawPage(false);
    };


    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const articleRefs = useRef<Array<HTMLDivElement | null>>([]);


    const handleRatingChange = (articleId: string, rating: string) => {
        setRatings((prevRatings) => {
            const updatedRatings = { ...prevRatings, [articleId]: rating };
            if (rating === 'No Issue Present') {
                setIssueFields((prevIssueFields) => {
                    const { [articleId]: removedIssueField, ...rest } = prevIssueFields;
                    return rest;
                });
            }
            return updatedRatings;
        });
    };



    interface FilterQuery {
        value: string;
    }

    const handleFilterQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setfilterQuery((prev) => ({ ...prev, value: e.target.value }));
    };

    // New state variable for region filter
    const [filterRegion, setFilterRegion] = useState<{ region: string }>({ region: "" });

    // New handler for the region filter dropdown
    const handleFilterRegionChange = (value: string) => {
        setFilterRegion((prev) => ({ ...prev, region: value }));
    };

    const handleFilterFilesChange = (value: string) => {
        setfilterFiles((prev) => ({ ...prev, feature: value }));
    };

    const handleShowLawPage = (metadata: any, tags: any, database: string) => {
        let parsedMetadata = parseJSONSafely(metadata);
        let parsedTags = parseJSONSafely(tags);
        let generatedLawUrl = null;

         if (database === "EU_AI_ACT" && parsedTags && parsedTags.article) {
            const articleValue = parsedTags.article.match(/(\d+)/)?.[0];
          generatedLawUrl = articleValue ? `https://artificialintelligenceact.eu/article/${articleValue}/` : null;
        } else if (parsedMetadata && parsedMetadata.Law_url) {
            generatedLawUrl
            
            = parsedMetadata.Law_url;
        }

        if (generatedLawUrl

            
        ) {
            setLawPageUrl(generatedLawUrl);
            setShowLawPage(true);
        }
    };

     const [issueFields, setIssueFields] = useState<{ [articleId: string]: string[] }>({});
    const [tempIssueFields, setTempIssueFields] = useState<{ [articleId: string]: string[] }>({});


    const handleIssueFieldChange = (articleId: string, field: string) => {
      setTempIssueFields((prev) => {
          const updatedFields = { ...prev };
          if (updatedFields[articleId]) {
              if (updatedFields[articleId].includes(field)) {
                  updatedFields[articleId] = updatedFields[articleId].filter((f) => f !== field);
              } else {
                  updatedFields[articleId] = [...updatedFields[articleId], field];
              }
          } else {
              updatedFields[articleId] = [field];
          }
          return updatedFields;
      });
  };


    const handleIssueSubmit = (articleId: string) => {
        setIssueFields((prev) => ({
            ...prev,
            [articleId]: tempIssueFields[articleId] || [],
          }));
    }
    

    const applyFilters = () => {
        console.log("Applying filters");
        const filterObject: Record<string, string> = {};

        // if (filterQuery.value) {
        //   filterObject["query"] = filterQuery.value;
        // }

        if (filterRegion.region) { // Use filterRegion.region here
            filterObject["region"] = filterRegion.region;
        }

        if (filterFiles.feature) {
            filterObject["database"] = filterFiles.feature || "National";
        } else {
            filterObject["database"] = "National";
        }

        filterObject["model"] = appData.model;

        if (!filterFiles.feature) {
            toast.warning("Please submit a search query and file filter before applying filters.");
            console.log("No filters applied: Both filterQuery and filterFiles are empty.");
            return;
        }

        console.log("Generated filter object:", filterObject);

        actions.submit.applyFilter(filterObject);
    };


    const renderLoader = () => (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        </div>
    );
    
        const allRatingsDone = () => {
        if (!data.contexts) return false;
        return data.contexts.every(context => ratings[context.id] !== undefined);
    };


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

                        {filterFiles.feature === "Regional_articles" && (
                            <div className="flex flex-col items-center">
                                <Select value={filterRegion.region} onValueChange={handleFilterRegionChange}>
                                    <SelectTrigger className="w-36 h-[40px] border-gray-400">
                                        <SelectValue placeholder="Select Region to filter" className="text-sm">
                                            {filterRegion.region ? (
                                                filterableRegion.find((region) => region.value === filterRegion.region)?.label
                                            ) : (
                                                "Select Region"
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="w-36">
                                        {filterableRegion.map((region) => (
                                            <SelectItem key={region.value} value={region.value}>
                                                {region.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button onClick={applyFilters} className="h-[40px]">
                            Fetch
                        </Button>
                         {allRatingsDone() && (
                            <Button onClick={() => setIsFeedbackFormOpen(true)} className="h-[40px]">
                                Submit
                           </Button>
                         )}
                    </div>
                    <div className="grid grid-cols-1 gap-8 w-full ml-2">
                        {data.contexts.map((context, index) => (
                            <div
                                key={uuidv4()}
                                ref={(element) => (articleRefs.current[index] = element)}
                                className={`cursor-pointer group 
                                    hover:scale-[1.02] active:scale-[0.98]
                                    transition-all duration-200 
                                    bg-bg-verba hover:bg-button-verba
                                    rounded-xl p-4 
                                    shadow-sm 
                                    border-2 border-transparent
                                    hover:border-button-hover-verba ${selectedIndex === index ? "border-button-hover-verba" : ""
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg mb-2">Content</h3>
                                    {context.publication_date && (
                                        <p className="text-sm text-gray-500">
                                            <span className="font-bold">Publication date:</span> {context.publication_date}
                                        </p>
                                    )}
                                    {context.date && (
                                        <p className="text-sm text-gray-500">
                                            <span className="font-bold">Date:</span> {context.date}
                                        </p>
                                    )}
                                    {context.hearing_date && (
                                        <p className="text-sm text-gray-500">
                                            <span className="font-bold">Hearing Date:</span> {context.hearing_date}
                                        </p>
                                    )}
                                </div>

                                <p className="mb-4">{context.content}</p>

                                <div className="mb-2">
                                    <span className="font-bold">Tags:</span>
                                    <pre className="bg-gray-100 p-2 rounded-md overflow-auto text-sm">
                                        {JSON.stringify(parseJSONSafely(context.tags), null, 2)}
                                    </pre>
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Metadata:</span>
                                    <pre className="bg-gray-100 p-2 rounded-md overflow-auto text-sm">
                                        {JSON.stringify(parseJSONSafely(context.metadata), null, 2)}
                                    </pre>
                                </div>
                                {context.description && (
                                    <div className="mb-2">
                                        <span className="font-bold">Description:</span> <p className="text-sm">{context.description}</p>
                                    </div>
                                )}
                                <div className="mb-2">
                                    <span className="font-bold">Category:</span>
                                    <pre className="bg-gray-100 p-2 rounded-md overflow-auto text-sm">
                                        {JSON.stringify(parseJSONSafely(context.category), null, 2)}
                                    </pre>
                                </div>
                                {context.entry_to_force && (
                                    <p className="text-sm">
                                        <span className="font-bold">Entry to Force:</span> {context.entry_to_force}
                                    </p>
                                )}
                                {context.date_to && (
                                    <p className="text-sm">
                                        <span className="font-bold">Date To:</span> {context.date_to}
                                    </p>
                                )}

                                {/* Show Law Page Button */}
                                { (filterFiles.feature === "EU_AI_ACT" && parseJSONSafely(context.tags)?.article) || parseJSONSafely(context.metadata)?.Law_url ? (
                                    <Button onClick={() => handleShowLawPage(context.metadata, context.tags, filterFiles.feature)} className="mt-2">
                                        Show Law Page
                                    </Button>
                                ) : null}

                                <div className="flex flex-row  justify-between mt-2">
                                    {context['date-from'] && (
                                        <span className="text-sm text-text-alt-verba group-hover:text-text-verba-button">
                                            {new Date(context['date-from']).toISOString().split('T')[0]}
                                        </span>
                                    )}

                                    <div>
                                        <div className="flex space-x-2">
                                            {["Has Issue", "No Issue Present"].map((rating, index) => (
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
                                {ratings[context.id] === 'Has Issue' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="mt-2">Report Issues</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Select Issue Fields</DialogTitle>
                                                <DialogDescription>
                                                    Select the fields that have issues.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                {Object.keys(context)
                                                    .filter(key => key !== "id" && key !== "content" && key !== "metadata" && key !== "tags" && key !== "category")
                                                    .map((key) => (
                                                        <div className="flex items-center space-x-2" key={key}>
                                                            <Label htmlFor={`issue-${context.id}-${key}`} >
                                                                {key}
                                                            </Label>
                                                            <input
                                                                type="checkbox"
                                                                id={`issue-${context.id}-${key}`}
                                                                checked={tempIssueFields[context.id]?.includes(key)}
                                                                onChange={() => handleIssueFieldChange(context.id, key)}
                                                                className="ml-2"
                                                            />
                                                        </div>
                                                    ))}
                                                {Object.keys(parseJSONSafely(context.metadata)).map((key) => (
                                                    <div className="flex items-center space-x-2" key={`metadata-${key}`}>
                                                         <Label htmlFor={`issue-${context.id}-metadata-${key}`}>
                                                               {`metadata-${key}`}
                                                            </Label>
                                                            <input
                                                                type="checkbox"
                                                                id={`issue-${context.id}-metadata-${key}`}
                                                                 checked={tempIssueFields[context.id]?.includes(`metadata-${key}`)}
                                                                  onChange={() => handleIssueFieldChange(context.id,`metadata-${key}`)}
                                                                    className="ml-2"
                                                                />
                                                    </div>
                                                ))}
                                                 {Object.keys(parseJSONSafely(context.tags)).map((key) => (
                                                     <div className="flex items-center space-x-2" key={`tags-${key}`}>
                                                           <Label htmlFor={`issue-${context.id}-tags-${key}`}>
                                                                {`tags-${key}`}
                                                             </Label>
                                                            <input
                                                                type="checkbox"
                                                                id={`issue-${context.id}-tags-${key}`}
                                                                checked={tempIssueFields[context.id]?.includes(`tags-${key}`)}
                                                                onChange={() => handleIssueFieldChange(context.id, `tags-${key}`)}
                                                                  className="ml-2"
                                                            />
                                                        </div>
                                                 ))}
                                                  {Object.keys(parseJSONSafely(context.category)).map((key) => (
                                                        <div className="flex items-center space-x-2" key={`category-${key}`}>
                                                               <Label htmlFor={`issue-${context.id}-category-${key}`}>
                                                                    {`category-${key}`}
                                                               </Label>
                                                                 <input
                                                                      type="checkbox"
                                                                      id={`issue-${context.id}-category-${key}`}
                                                                    checked={tempIssueFields[context.id]?.includes(`category-${key}`)}
                                                                    onChange={() => handleIssueFieldChange(context.id, `category-${key}`)}
                                                                       className="ml-2"
                                                                   />
                                                        </div>
                                                  ))}
                                            </div>
                                              <Button className="mt-4" onClick={() => handleIssueSubmit(context.id)}>Submit</Button>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {issueFields[context.id] && issueFields[context.id].map((field, index) => (
                                    <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 mt-2">
                                       {field}
                                   </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {showLawPage && lawPageUrl && (
                <div className="flex flex-col w-[45vw] bg-bg-verba p-4 rounded-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Law Page</h2>
                        <Button onClick={handleCloseArticle} variant="ghost">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mt-4">
                        <iframe
                            src={lawPageUrl}
                            className="w-full h-[80vh]" // Increased height of the iframe
                            title="Law Page"
                        />
                    </div>
                </div>
            )}
             {isFeedbackFormOpen && (
                <FeedbackForm
                  isOpen={isFeedbackFormOpen}
                  onCancel={() => setIsFeedbackFormOpen(false)}
                  listOfArticles={data.contexts}
                  ratings={ratings}
                   filterQuery={filterQuery}
                  onRatingChange={handleRatingChange}
                 selectedUser='selectedUser'
                  filterFile={filterFiles}
                  model={appData.model}
                  issueFields = {issueFields}
                  filterRegion={filterRegion}
               />
            )}
        </div>
    );


    const render = () => {
        console.log("UIIIIIIIIIIIIIIIIII contexts:", data.contexts);
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