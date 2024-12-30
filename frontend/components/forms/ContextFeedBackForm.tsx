import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import React, { memo, useState } from "react";
import { toast } from "react-toastify";


interface FilterQuery {
  value: string;
}

interface FilterFile{
  feature:string;
}

interface FeedbackFormProps {
  isOpen: boolean;
  listOfArticles: { id?: string; article_name?: string; article_title?: string }[];
  ratings: { [key: string]: string | null };
  filterQuery: FilterQuery; 
  onCancel: () => void;
  onRatingChange: (articleId: string, rating: string) => void;
  selectedUser: string
  filterFile:FilterFile;
  model:string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = memo(function FeedbackForm({
  isOpen,
  listOfArticles,
  ratings,
  filterQuery,
  onCancel,
  onRatingChange,
  selectedUser,
  filterFile,
  model

}) {
  const [feedback, setFeedback] = useState("");

  const handleRatingChange = (articleId: string, rating: string) => {
    onRatingChange(articleId, rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
  
    const feedbackData = {
      feedback,
      ratings: listOfArticles
        .filter((article) => ratings[article.id!]) 
        .map((article) => ({
          id: article.id!,
          rating: ratings[article.id!],
        })),
      filterQuery, 
      selectedUser,
      filterFile,
      feedbackType : "context",
      model
    };
  
    try {
      const response = await fetch("http://74.241.130.204:1111/context/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
  
      toast.success("Feedback submitted successfully");
      setFeedback("");
      onCancel();
    } catch (error: any) {
      toast.error("Error submitting feedback: " + error.message);
    }
  };
  
  

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[800px] overflow-y-auto">
        <DialogTitle className="text-xl">Context Feedback Form</DialogTitle>
        <p className="text-center text-xl mt-2">
          Thank you for taking the time to provide your honest feedback. How relevant do you find the articles?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <h5 className="text-xl font-semibold">Articles</h5>
            <div className="grid grid-cols-1 gap-4">
              {listOfArticles.length === 0 ? (
                <p className="text-center text-gray-500">No articles available for feedback.</p>
              ) : (
              listOfArticles.map((article) => (
                <div key={article.id} className="space-y-4">
                  <div>{article.article_title || article.article_name}</div>
                  <div className="flex justify-center space-x-4">
                    {["Relevant", "Semi-relevant", "Irrelevant"].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`rating-${article.id}`}
                          id={`rating-${article.id}-${rating}`}
                          checked={ratings[article.id!] === rating}
                          onChange={() => handleRatingChange(article.id!, rating)}
                          className="hidden"
                        />
                        <label htmlFor={`rating-${article.id}-${rating}`} className="flex items-center">
                          <svg
                            className={`w-8 h-8 ${
                              ratings[article.id] === rating ? "fill-gray-500 border-gray-500"
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
              ))
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <label className="block text-xl font-semibold">Additional Feedback</label>
            <textarea
              className="w-full p-2 border rounded-md resize-none"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
              placeholder="Please provide any additional feedback (optional)"
            />
          </div>

          <DialogFooter>
            <Button type="submit">Submit Feedback</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default FeedbackForm;
