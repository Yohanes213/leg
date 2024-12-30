import { ContextState, useContextsContext } from "@/hooks/useContextsContext";
import { useEffect, useState } from "react";

export const ContextsComponent = () => {
  const { state, data, actions } = useContextsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showSupportingArticles, setShowSupportingArticles] = useState(false);
  const [showUpdatingArticles, setShowUpdatingArticles] = useState(false);

  const [selectedSupportingArticle, setSelectedSupportingArticle] = useState(null);
  const [selectedUpdatingArticle, setSelectedUpdatingArticle] = useState(null);
  const detailViewKey = selectedArticle ? selectedArticle.id : null;

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    setShowSupportingArticles(false);
    setShowUpdatingArticles(false);
    setSelectedSupportingArticle(null);
    setSelectedUpdatingArticle(null);
  };

  const handleSearch = () => {
    console.log('Search triggered with query:', searchQuery);
    actions.fetch.contexts(searchQuery);
  };
  
  useEffect(() => {
    actions.fetch.contexts(searchQuery);
  }, []);

  return (
    <div className="flex justify-center gap-3 h-[80vh]">
      <div className="hidden md:flex md:w-[45vw]">
        <div className="flex flex-col gap-2 w-full">
          <div className="bg-bg-alt-verba rounded-2xl flex gap-2 p-6 items-center justify-between h-min w-full">
            <div className="hidden lg:flex gap-2 justify-start w-[8vw]">
              <div className="items-center gap-2 flex">
                <div className="relative">
                  <button className="btn rounded-lg flex-grow items-center justify-center border-none btn-circle btn-xs hover:bg-button-hover-verba hover:text-text-verba-button bg-button-verba shadow-none text-text-alt-verba-button">
                    <div className="flex gap-2 items-center">
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 192 512" className="w-[20px]" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"></path>
                      </svg>
                    </div>
                  </button>
                </div>
                <p className="text-sm text-text-alt-verba truncate max-w-[350px]">Search</p>
              </div>
            </div>
            <label className="input flex items-center gap-2 w-full bg-bg-verba">
              <input 
                className="grow w-full" 
                placeholder="Search for laws ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </label>
            <button onClick={handleSearch} className="btn rounded-lg flex-grow items-center justify-center border-none hover:bg-button-hover-verba hover:text-text-verba-button bg-button-verba shadow-none text-text-alt-verba-button">
              <div className="flex gap-2 items-center">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-[20px]" height="15" width="15" xmlns="http://www.w3.org/2000/svg">
                  <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
                </svg>
              </div>
            </button>
          </div>

          {/* Results List */}
          {/* <div className="bg-bg-alt-verba rounded-2xl flex flex-col p-6 gap-3 items-center h-full w-full overflow-auto">
            <div className="flex flex-col w-full">
              {data.contexts.map((context) => (
                <div key={context.id} className="flex justify-between items-center gap-2 rounded-2xl p-1 w-full">
                  <div className="flex justify-between items-center w-full gap-2">
                    <button 
                      onClick={() => setSelectedArticle(context)}
                      className="w-[200px] lg:w-[400px] btn rounded-lg flex-grow items-center justify-center border-none hover:bg-button-hover-verba hover:text-text-verba-button bg-button-verba shadow-none text-text-alt-verba-button"
                    >
                      <div className="flex gap-2 items-center">
                        <p className="text-sm truncate max-w-[150px] lg:max-w-[350px]">
                          {context.article_name}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
          <div className="grid grid-cols-1 gap-4 w-full">
  {data.contexts.map((context) => (
    <div 
      key={context.id} 
      onClick={() => setSelectedArticle(context)}
      className="cursor-pointer group 
                 hover:scale-[1.02] active:scale-[0.98]
                 transition-all duration-200 
                 bg-bg-verba hover:bg-button-verba
                 rounded-xl p-4 
                 shadow-sm hover:shadow-md
                 border-2 border-transparent
                 hover:border-button-hover-verba"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg group-hover:text-text-alt-verba-button">{context.article_name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-alt-verba group-hover:text-text-verba-button">
            {context['date-from']}
          </span>
          <svg 
            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  ))}
</div>

        </div>
      </div>

      {/* Detail Panel */}
      
{selectedArticle && (
  <div className="md:w-[55vw] w-full flex" key={detailViewKey}>
    <div className="flex flex-col gap-2 w-full">
      <div className="bg-bg-alt-verba rounded-2xl flex flex-col p-6 h-full w-full overflow-y-auto overflow-x-hidden relative">
        {/* Add close button in the top-right corner */}
        {/* Add cleanup when closing articles */}
       

        {/* Replace the existing close button handler with our new function */}
        <button 
          onClick={handleCloseArticle}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-button-hover-verba transition-colors duration-200"
        >
          <svg className="w-6 h-6 text-text-alt-verba" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Also update the modal close buttons */}
        {/* <button 
          onClick={handleCloseArticle}
          className="btn px-6 py-2 rounded-xl bg-button-verba hover:bg-button-hover-verba text-text-alt-verba-button"
        >
          Close
        </button> */}

        {/* Rest of your existing selectedArticle content */}
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-verba mb-3">
              {selectedArticle.article_name}
            </h2>
            <div className="flex gap-4 text-sm text-text-alt-verba bg-bg-verba rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
                <span>From: {selectedArticle['date-from']}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
                <span>To: {selectedArticle['date-to']}</span>
              </div>
            </div>
          </div>

          {/* Article Detail Section */}
          {/* <div className="bg-bg-verba rounded-lg p-6 mb-6">
            <div className="prose max-w-none">
              <p className="text-text-verba">{selectedArticle.article_detail}</p>
            </div>
          </div> */}
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
        </div>

          {/* Action Buttons Section */}
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
              Updating Articles ({selectedArticle.update_articles.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{/* Add Modal Components */}
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
                  {/* <p className="text-sm text-text-alt-verba line-clamp-2">{article.article_detail}</p> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Article Detail View */}
        <div className="w-1/2 p-6 bg-white">
          {selectedSupportingArticle ? (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedSupportingArticle.article_name}</h2>
              <div className="bg-gray-50 rounded-xl p-6 flex-grow overflow-y-auto">
                <div className="prose max-w-none text-gray-800">
                  <p className="text-text-verba whitespace-pre-line">
                    {/* {selectedSupportingArticle.article_detail} */}
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
            {selectedArticle.update_articles.map(article => (
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
};

export default ContextsComponent;
