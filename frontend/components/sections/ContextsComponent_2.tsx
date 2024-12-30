"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContextState, useContextsContext } from "@/hooks/useContextsContext";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import SortableTable, { TableColumn } from "../blocks/SortableTable";
import AddProduct from "./AddProduct";
import ProductDetail from "./ProductDetail";

const ContextComponent = () => {
    console.log("ContextComponent is being called")
  const { state, data, actions } = useContextsContext();
  const [filters, setFilters] = useState<Array<{ feature: string; value: string }>>([]);

  const columns: TableColumn[] = [
    { accessor: "id", header: "ID", sortable: true },
    { accessor: "name", header: "Name", sortable: true },
    // Add more columns as needed
  ];

  const renderContextList = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Context Management</h1>
        <Button size="sm" onClick={actions.click.addContext}>
          Add New Context
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <SortableTable 
          columns={columns} 
          data={data.contexts} 
          onRowClick={actions.click.selectContext} 
        />
      </div>
      {/* Add pagination similar to ProductComponent */}
    </div>
  );

  const render = () => {
    console.log("ContextComponent is being render")
    console.log(state.contextState)
    // console.log(ContextState.Idle)
    // console.log(ContextState.FetchingContexts)
    switch (state.contextState) {
      case ContextState.Idle:
      case ContextState.FetchingContexts:
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
          </div>
        );
      case ContextState.DisplayingContextsTable:
        return renderContextList();
      // Add other cases as needed
    }
  };

  return render();
};

export default ContextComponent;