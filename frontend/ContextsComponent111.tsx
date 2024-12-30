</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
  <div className="w-1/3 p-4">
    <Input 
      type="text" 
      placeholder="Search query..." 
      value={filterQuery.value} 
      onChange={handleFilterQueryChange} 
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          applyFilters();
        }
      }}
    />
  </div>
  
  <div className="w-1/3 p-4 flex items-center">
    <Button onClick={applyFilters}>Apply Filters</Button>
  </div>
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
  <span className="text-sm text-text-alt-verba group-hover:text-text-verba-button">
          {new Date(context['date-from']).toISOString().split('T')[0]}
        </span>
    <div>