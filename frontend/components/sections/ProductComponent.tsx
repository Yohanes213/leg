"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductState, useProductContext } from "@/hooks/useProductContext";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import SortableTable, { TableColumn } from "../blocks/SortableTable";
import AddProduct from "./AddProduct";
import ProductDetail from "./ProductDetail";

const filterableFeatures = [
  { value: "id", label: "ID" },
  { value: "detail", label: "Detail" },
  { value: "text", label: "Text" },
  // { value: "name", label: "Name" },
  // { value: "manufacturer", label: "Manufacturer" },
  // { value: "form_factor", label: "Form Factor" },
  // { value: "processor_architecture", label: "Processor Architecture" },
  // { value: "processor_core_count", label: "Core Count" },
  // { value: "processor_manufacturer", label: "Processor Manufacturer" },
  // { value: "processor_tdp", label: "Processor TDP" },
  // { value: "memory", label: "Memory" },
  // { value: "onboard_storage", label: "Onboard Storage" },
  // { value: "input_voltage", label: "Input Voltage" },
  // { value: "operating_system_bsp", label: "Operating System BSP" },
  // { value: "operating_temperature_max", label: "Max Operating Temperature" },
  // { value: "operating_temperature_min", label: "Min Operating Temperature" },
  // { value: "price", label: "Price" },
  // { value: "stock_availability", label: "Stock Availability" },
];


const filterableDatabases = [
  { value: "civil", label: "Civil" },
  { value: "labour", label: "Labour" },

];

const ProductComponent = () => {
  const { state, data, actions } = useProductContext();
  const [filters, setFilters] = useState<Array<{ feature: string; value: string }>>([]);
  const [currentFilter, setCurrentFilter] = useState({ feature: "", value: "" });
  const [databaseFilter, setDatabaseFilter] = useState({ feature: "", value: "" });
  const [products, setListOfProducts] = useState<Array<{
    id?: string;
    detail?: string;
    text?: string;
}>>([]);

  const columns: TableColumn[] = [
    { accessor: "id", header: "ID", sortable: true },
    { accessor: "text", header: "Text", sortable: true },
    { accessor: "detail", header: "Detail", sortable: true },
    // { header: "Name", accessor: "name", sortable: true },
    // { header: "Manufacturer", accessor: "manufacturer", sortable: true },
    // { header: "Form Factor", accessor: "formFactor", sortable: true },
    // { header: "Processor Architecture", accessor: "processorArchitecture", sortable: true },
    // { header: "Core Count", accessor: "processorCoreCount", sortable: true },
    // { header: "Processor Manufacturer", accessor: "processorManufacturer", sortable: true },
    // { header: "Processor TDP", accessor: "processorTdp", sortable: true },
    // { header: "Memory", accessor: "memory", sortable: true },
    // { header: "Onboard Storage", accessor: "onboardStorage", sortable: true },
    // { header: "Input Voltage", accessor: "inputVoltage", sortable: true },
    // { header: "I/O Count", accessor: "ioCount", sortable: true, cell: (value: string[]) => value.join(", ") },
    // { header: "Wireless", accessor: "wireless", sortable: true, cell: (value: string[]) => value.join(", ") },
    // { header: "Operating System BSP", accessor: "operatingSystemBsp", sortable: true, cell: (value: string[]) => value.join(", ") },
    // { header: "Max Operating Temperature", accessor: "operatingTemperatureMax", sortable: true },
    // { header: "Min Operating Temperature", accessor: "operatingTemperatureMin", sortable: true },
    // { header: "Certifications", accessor: "certifications", sortable: true, cell: (value: string[]) => value.join(", ") },
    // { header: "Price", accessor: "price", sortable: true },
    // { header: "Stock Availability", accessor: "stockAvailability", sortable: true },
  ];

  
  useEffect(() => {
    if (data.products && data.products.length > 0) {
      setListOfProducts(data.products);
    }
  }, [data.products, setListOfProducts]);

  const handleFilterFeatureChange = (value: string) => {
    setCurrentFilter((prev) => ({ ...prev, feature: value }));
  };
  const handleFilterDatabaseChange = (value: string) => {
    setDatabaseFilter((prev) => ({ ...prev, feature: value }));
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFilter((prev) => ({ ...prev, value: e.target.value }));
  };

  const addFilter = () => {
    if (currentFilter.feature && currentFilter.value) {
      setFilters((prev) => [...prev, currentFilter]);
      setCurrentFilter({ feature: "", value: "" });
    }
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const applyFilters = () => {
    console.log("apply filters")
    console.log(filters)
    const filterObject = filters.reduce((acc, { feature, value }) => {
      acc[feature] = value;
      return acc;
    }, {} as Record<string, string>);

    console.log(filterObject)
    console.log(databaseFilter)
    if(databaseFilter.feature != ""){
      filterObject["classname"] = databaseFilter.feature;
    }
    console.log(filterObject)
    actions.submit.applyFilter(filterObject);
  };

  const clearFilters = () => {
    setFilters([]);
    setCurrentFilter({ feature: "", value: "" });
    actions.submit.applyFilter({});
  };

  const renderProductList = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Template Management</h1>
        <Button size="sm" onClick={actions.click.addProducts}>
          Add New Template
        </Button>
      </div>
      <div className="mb-4 space-y-2">
        <div className="flex items-end space-x-2">
          {/* <div className="w-1/3">
            <Select value={currentFilter.feature} onValueChange={handleFilterFeatureChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select feature to filter" />
              </SelectTrigger>
              <SelectContent>
                {filterableFeatures.map((feature) => (
                  <SelectItem key={feature.value} value={feature.value}>
                    {feature.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={databaseFilter.feature} onValueChange={handleFilterDatabaseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select database to filter" />
              </SelectTrigger>
              <SelectContent>
                {filterableDatabases.map((feature) => (
                  <SelectItem key={feature.value} value={feature.value}>
                    {feature.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex flex-col space-y-4 w-1/3 p-4">
          <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">Database Filter</label>
                <Select value={databaseFilter.feature} onValueChange={handleFilterDatabaseChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select database to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableDatabases.map((feature) => (
                      <SelectItem key={feature.value} value={feature.value}>
                        {feature.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">Feature Filter</label>
                <Select value={currentFilter.feature} onValueChange={handleFilterFeatureChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select feature to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableFeatures.map((feature) => (
                      <SelectItem key={feature.value} value={feature.value}>
                        {feature.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>

          <div className="w-1/3 p-4">
            <Input type="text" placeholder="Filter value..." value={currentFilter.value} onChange={handleFilterValueChange} disabled={!currentFilter.feature} />
          </div>
          <div className="flex w-1/3 p-4 justify-end space-x-2">
            <Button onClick={addFilter} disabled={!currentFilter.feature || !currentFilter.value}>
              Add Filter
            </Button>
            {/* disabled={filters.length === 0} */}
            <Button onClick={applyFilters} >
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center rounded-full bg-gray-100 px-3 py-1">
                <span>{`${filterableFeatures.find((f) => f.value === filter.feature)?.label}: ${filter.value}`}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFilter(index)} className="ml-2 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        {/* weffwefewf */}
        <SortableTable columns={columns} data={data.products} onRowClick={actions.click.selectProduct} />
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={actions.click.previousPage} disabled={data.currentPage === 0}>
          Previous
        </Button>
        <span>
          Page {data.currentPage + 1} of {Math.ceil(data.totalProducts / 6)}
        </span>
        <Button onClick={actions.click.nextPage} disabled={(data.currentPage + 1) * 6 >= data.totalProducts}>
          Next
        </Button>
      </div>
    </div>
  );

  console.log(`ProductComponent State: ${state.productState}`);
  const render = () => {
    if (data.products && data.products.length > 0) {
      return renderProductList();
    }
    switch (state.productState) {
      case ProductState.Idle:
      case ProductState.FetchingProducts:
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
          </div>
        );
      case ProductState.DisplayingProductsTable:
        return renderProductList();
      case ProductState.DisplayingAddProductsForm:
        return <AddProduct state={state.addProductState} actions={actions} />;
      case ProductState.DisplayingProductsDetailModal:
        return <ProductDetail state={state.displayProductState} product={data.product} actions={actions} />;
      default:
        return null;
    }
  };


  return render();
};

export default ProductComponent;

