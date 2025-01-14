import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { DisplayProductState, ProductActions } from "@/hooks/useProductContext";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

interface ProductDetailProps {
  state: DisplayProductState;
  product: Product | null;
  actions: ProductActions;
}

const formatLabel = (key: string): string => {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ProductDetail = ({ state, product, actions }: ProductDetailProps) => {
  console.log(`ProductDetail state: ${state}`);
  const [editedProduct, setEditedProduct] = useState<Product | null>(product);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleUpdateSubmit = () => {
    console.log(editedProduct)
    // qwfqwfqf
    if (editedProduct) {
      actions.submit.updateProduct(editedProduct);
    }
  };

  const handleDeleteSubmit = () => {
    if (product) {
      actions.submit.deleteProduct(product.id);
    }
  };

  const renderProductFields = (isEditing: boolean) => {
    if (!product) return null;

    return (
      // <ScrollArea className="h-[60vh] pr-4">
      //   <div className="grid grid-cols-2 gap-4">
      //     {Object.entries(product).map(([key, value]) => {
      //       if (React.isValidElement(value)) return null;
      //       const isTextArea = key === "detail" || key === "text" //|| key === "shortSummary";
      //       console.log("*************************")
      //       console.log(isTextArea)
      //       console.log(key)
      //       console.log(value)
      //       console.log( <div key={key} className={isTextArea ? "col-span-2" : ""}>
      //         <Label htmlFor={key}>{formatLabel(key)}</Label>
      //         {isEditing ? (
      //           isTextArea ? (
      //             <Textarea id={key} name={key} value={editedProduct?.[key as keyof Product] || ""} onChange={handleInputChange} />
      //           ) : (
      //             <Input id={key} name={key} value={editedProduct?.[key as keyof Product] || ""} onChange={handleInputChange} />
      //           )
      //         ) : (
      //           <p className="mt-1 text-sm text-gray-600">{value}</p>
      //         )}
      //       </div>)
      //       return (
      //         <div key={key} className={isTextArea ? "col-span-2" : ""}>
      //           <Label htmlFor={key}>{formatLabel(key)}</Label>
      //           {isEditing ? (
      //             isTextArea ? (
      //               <Textarea id={key} name={key} value={editedProduct?.[key as keyof Product] || ""} onChange={handleInputChange} />
      //             ) : (
      //               <Input id={key} name={key} value={editedProduct?.[key as keyof Product] || ""} onChange={handleInputChange} />
      //             )
      //           ) : (
      //             <p className="mt-1 text-sm text-gray-600">{value}</p>
      //           )}
      //         </div>
      //       );
      //     })}
      //   </div>
      // </ScrollArea>
      <ScrollArea className="h-[60vh] pr-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(product).map(([key, value]) => {
          // Skip rendering if value is a React element
          if (React.isValidElement(value)) return null;
          
          const isTextArea = key === "detail" ;
          // if (key === "_addtional"){
          //   value = JSON.stringify(value)
          // }
          return (
            <div key={key} className={isTextArea ? "col-span-2" : ""}>
              <Label htmlFor={key}>{formatLabel(key)}</Label>
              {isEditing && key !== "id"  ? (
                isTextArea ? (
                  <Textarea 
                    id={key} 
                    name={key} 
                    value={String(editedProduct?.[key as keyof Product] || "")} 
                    onChange={handleInputChange}
                    className="w-full resize-y"
                    // className="mt-1 text-sm text-gray-600"
                    rows={10}
                  />
                ) : (
                  <Textarea 
                    id={key} 
                    name={key} 
                    value={String(editedProduct?.[key as keyof Product] || "")} 
                    onChange={handleInputChange} 
                    // className="mt-1 text-sm text-gray-600"
                  />
                )
              ) : (
                <p className="mt-1 text-sm text-gray-600">{String(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
    );
  };

  const render = () => {
    if (!product) return null;

    let content;
    let title;
    let footer;

    console.log(`++ProductDetail State: ${state}`);

    switch (state) {
      case DisplayProductState.DisplayingProduct:
        console.log(`ProductDetail product: ${JSON.stringify(product)}`);
        title = product.text;
        content = renderProductFields(false);
        console.log("Render product field")
        console.log(content)
        footer = (
          <>
            <Button onClick={actions.click.selectUpdateProduct}>Update Product</Button>
            <Button variant="destructive" onClick={actions.click.selectDeleteProduct}>
              Delete Product
            </Button>
          </>
        );
        break;
      case DisplayProductState.DisplayingUpdateProductForm:
        console.log(`DisplayingUpdateProductForm: ${JSON.stringify(product)}`);
        title = `Update Product: ${product.text}`;
        content = renderProductFields(true);
        console.log("Render product field 2")
        console.log(content)
        footer = (
          <>
            <Button onClick={handleUpdateSubmit}>Update</Button>
            <Button variant="outline" onClick={actions.cancel.productUpdate}>
              Cancel
            </Button>
          </>
        );
        break;
      case DisplayProductState.DisplayingDeleteProductForm:
        title = `Delete Product: ${product.text}`;
        content = <p className="mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>;
        footer = (
          <>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              Delete
            </Button>
            <Button variant="outline" onClick={actions.cancel.productUpdate}>
              Cancel
            </Button>
          </>
        );
        break;
      case DisplayProductState.UpdatingProduct:
        content = (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
          </div>
        );
        break;
      case DisplayProductState.DeletingProduct:
        content = (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="mr-2 h-16 w-16 animate-spin" />
          </div>
        );
        break;
      default:
        return null;
    }

    console.log("Reached at the end of product detail render function")

    return (
      <Dialog open={true} onOpenChange={() => actions.close.productDetailModal()}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {content}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return render();
};

export default ProductDetail;
