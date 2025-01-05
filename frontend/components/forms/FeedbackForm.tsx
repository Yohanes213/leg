// FeedbackForm.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import React, { memo, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';


interface FilterQuery {
    value: string;
}

interface FilterFile {
    feature: string;
}


interface FilterRegion {
    region: string
}
interface FeedbackFormProps {
    isOpen: boolean;
    listOfArticles: {
        id?: string;
        metadata?: string | null;
        tags?: string | null;
    }[];
    ratings: { [key: string]: string | null };
    filterQuery: FilterQuery;
     filterRegion : FilterRegion
    onCancel: () => void;
    onRatingChange: (articleId: string, rating: string) => void;
    selectedUser: string;
    filterFile: FilterFile;
    model: string;
    issueFields: { [articleId: string]: string[] };
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
    model,
    issueFields,
    filterRegion,
}) {
    const [feedback, setFeedback] = useState("");

    const parseJSONSafely = (jsonString: string | null | undefined) => {
        try {
            if (!jsonString) {
                return {};
            }
            const sanitizedString = jsonString.replace(/NaN/g, "null");
            return JSON.parse(sanitizedString);
        } catch (error) {
            console.error("Error parsing JSON:", error, "for JSON:", jsonString);
            return {};
        }
    };



    const getLawTitle = (
        metadata: string | null | undefined,
        tags: string | null | undefined
    ): string => {
        const safeParse = (data: string | null | undefined): any => {
            try {
                return JSON.parse(data || '{}');
            } catch {
                return null; // Return null if parsing fails
            }
        };

        try {
            // Parse metadata safely
            const parsedMetadata = safeParse(metadata);

            // Check for law_title inside metadata
            if (parsedMetadata && parsedMetadata.law_title) {
                return parsedMetadata.law_title;
            }

            // Parse tags safely
            const parsedTags = safeParse(tags);
            if (parsedTags && typeof parsedTags === 'object' && parsedTags.article) {
                return parsedTags.article;
            }

            // Default return if no title is found
            return 'No Article Title';
        } catch (error) {
            console.error('Unexpected error in getLawTitle:', error);
            return 'No Article Title';
        }
    };


    const handleRatingChange = (articleId: string, rating: string) => {
        onRatingChange(articleId, rating);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }

         const formattedRatings = listOfArticles
            .filter((article) => ratings[article.id!])
            .map((article) => {
                const articleId = article.id!;
                const rating = ratings[articleId];
                 return {
                    id: articleId,
                    issue: rating === "Has Issue" ? "Yes" : "No",
                    issue_tag: rating === "Has Issue" ? issueFields[articleId] : [],
                     feedback: feedback,
                };
            });

        const feedbackData = {
            feedback,
            ratings: formattedRatings,
            filterQuery,
            selectedUser,
            filterFile,
             filterRegion,
            model,
        };

       try {
         const response = await axios.post(
           "http://localhost:1111/data_quality/submit-feedback",
           feedbackData,
             {
               headers: {
                   "Content-Type": "application/json",
               },
             }
         );

           if (response.status === 200) {
            toast.success("Feedback submitted successfully");
            setFeedback("");
            onCancel();
            } else {
              toast.error("Failed to submit feedback");
           }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Error submitting feedback");
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
                                        <div>{getLawTitle(article.metadata, article.tags)}</div>
                                        <div className="flex justify-center space-x-4">
                                            {["Has Issue", "No Issue Present"].map((rating) => (
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
                                                            className={`w-8 h-8 ${ratings[article.id] === rating
                                                                    ? "fill-gray-500 border-gray-500"
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