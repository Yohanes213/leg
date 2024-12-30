import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import React, { memo, useState } from "react";
import { toast } from "react-toastify";

interface ChatResponse {
  messageId: string;
  responseText: string;
}

interface FilterQuery {
  value: string;
}

interface FilterFile{
  feature:string;
}

interface AccuracyFeedbackFormProps {
  isOpen: boolean;
  listOfResponses: { id?: string; content?: string; 
  docsSummary?: {
    content?: string;
    filename?: string;
}[]; 
docsAnalysis?: {
  result?: string[];
  timeline?: {
      date?: string;
      event?: string;
      actors?: string[];
  }[];
}[]; 
   type?: string; }[]; 
  ratingschat: { [key: string]: string | null };
  onCancel: () => void;
  selectedUser: string;
  onRatingChangechat: (messageId: string, rating: string) => void;
  model:string;

}

const AccuracyFeedbackForm: React.FC<AccuracyFeedbackFormProps> = memo(function AccuracyFeedbackForm({
  isOpen,
  listOfResponses,
  onCancel,
  selectedUser,
  onRatingChangechat,
  ratingschat,
  model
}) {
  const [feedback, setFeedback] = useState("");

  const handleRatingChange = (messageId: string, rating: string) => {
    onRatingChangechat(messageId, rating);
  };
  const preprocessContent = (text: string) => text.replace(/\*\*/g, "").split("\\n").join("\n");

  const filterQuery = {value:""}
  const filterFile = {feature:""}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    const feedbackData = {
      feedback,
      ratings: listOfResponses
        .filter((reponse) => ratingschat[reponse.id!]) 
        .map((reponse) => ({
          id: reponse.id!,
          rating: ratingschat[reponse.id!],
        })),
      filterQuery, 
      selectedUser,
      filterFile,
      feedbackType :"chat",
      model
    };
console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",feedbackData)
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
        <DialogTitle className="text-xl">Chat Feedback Form</DialogTitle>
        <p className="text-center text-xl mt-2">
          Thank you for taking the time to provide your honest feedback. How Accurate do you find the Responses?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h5 className="text-xl font-semibold">Responses</h5>
                    <div className="grid grid-cols-1 gap-4">
                      {listOfResponses.length === 0 ? (
                        <p className="text-center text-gray-500">No responses available for feedback.</p>
                      ) : (
                        listOfResponses.map((response) => (
                          <div key={response.id} className="space-y-4">
                            {/* Render content based on message type */}
                            {response.content && (
                              <div>{preprocessContent(response.content)}</div>
                            )}
        
                            {/* For summarized_docs type */}
                            {response.docsSummary && response.docsSummary.length > 0 && response.type === 'summarized_docs' && (
                              <div className="flex flex-col p-2 my-2">
                                <div className="p-4 rounded-lg">
                                  <h3 className="text-lg font-semibold mb-2">Riepilogo dei documenti</h3>
                                  <div className="list-disc pl-6">
                                    {response.docsSummary.map((doc, index) => (
                                      <div key={index} className="mb-2 gap-4">
                                        <h5 className="font-semibold text-lg mb-2">{doc.filename}</h5>
                                        {preprocessContent(doc.content).split("\n").map((line, idx) => (
                                          <p key={idx}>{line}</p>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
        
                            {/* For analysis_report type */}
                            {response.docsAnalysis && response.docsAnalysis.length > 0 && response.type === 'analysis_report' && (
                              <div className="flex flex-col p-2 my-2">
                                <div className="p-4 rounded-lg shadow-sm">
                                  <h3 className="text-lg font-semibold mb-2">Rapporto di analisi</h3>
                                  <ul className="list-disc pl-6">
                                    {response.docsAnalysis.map((doc, index) => (
                                      <li key={index} className="mb-2">
                                        <div>
                                          <div>
                                            <h4 className="font-semibold">Risultato:</h4>
                                            <ul className="list-disc pl-6">
                                              {doc.result?.map((res, resIndex) => (
                                                <li key={resIndex}>{res}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold">Cronologia:</h4>
                                            <ul className="list-disc pl-6">
                                              {doc.timeline?.map((event, eventIndex) => (
                                                <li key={eventIndex}>
                                                  <div>Data: {event.date}</div>
                                                  <div>Evento: {event.event}</div>
                                                  <div>Attori: {event.actors?.join(', ')}</div>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
        
                            <div className="flex justify-center space-x-4">
                              {["Accurate", "Semi-accurate", "Inaccurate"].map((rating) => (
                                <div key={rating} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`rating-${response.id}`}
                                    id={`rating-${response.id}-${rating}`}
                                    checked={ratingschat[response.id!] === rating}
                                    onChange={() => handleRatingChange(response.id!, rating)}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`rating-${response.id}-${rating}`}
                                    className="flex items-center"
                                  >
                                    <svg
                                      className={`w-8 h-8 ${
                                        ratingschat[response.id] === rating
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

export default AccuracyFeedbackForm;
