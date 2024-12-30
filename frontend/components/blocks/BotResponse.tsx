// import { ResponseMessage } from "@/types";
// import React, { memo, useState } from "react";

// interface BotResponseProps {
//   message: ResponseMessage;
// }

// const BotResponse: React.FC<BotResponseProps> = memo(function BotResponse({ message }) {
//   const { content, document_path, summeraized_docs } = message;
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedContent, setSelectedContent] = useState<string | null>(null);

//   const preprocessContent = (text: string) => text.replace(/\*\*/g, "").split("\\n").join("\n");

//   const handleFileClick = (content: string) => {
//     setSelectedContent(content);
//     setIsModalOpen(true);
//   };

//   const renderContent = () => {
//     if (document_path && document_path !== "") {
//       const fileName = document_path.split("/").pop();
//       console.log("Document Path:", document_path);
//       return (
//         <span>
//           You can check the document{" "}
//           <a
//             href={document_path}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 hover:underline"
//           >
//             {fileName}
//           </a>{" "}
//           below the Uploaded by AI section. If you need any further assistance, feel free to ask!
//         </span>
//       );
//     }

//     if (summeraized_docs && summeraized_docs.length !== 0) {
//       console.log("Documents:", summeraized_docs);
//       return (
//         <div className="flex flex-col p-2 my-2">
//           {content && (
//             <div className="p-4 mb-4">
//               {preprocessContent(content).split("\n").map((line, index) => (
//                 <p key={index}>{line}</p>
//               ))}
//             </div>
//           )}

//           <div className="p-4 rounded-lg">
//             <h3 className="text-lg font-semibold mb-2">Riepilogo dei documenti</h3>
//             <div className="list-disc pl-6">
//               {summeraized_docs.map((doc, index) => (
//                 <div key={index} className="mb-2 gap-4">
//                     <h5 className="font-semibold text-lg mb-2">{doc.filename}</h5>
//                     {preprocessContent(doc.content).split("\n").map((line, idx) => (
//           <p key={idx}>{line}</p>
//         ))}
//                 </div>
               
//               ))}
//             </div>
//           </div>

//           {isModalOpen && selectedContent && (
//             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2">
//               <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
//                 >
//                   &times;
//                 </button>
//                 <h2 className="text-xl font-bold mb-4">Riepilogo del documento</h2>
//                 <div className="max-w-[800px] max-h-[600px] overflow-auto p-2">
//                   {preprocessContent(selectedContent).split("\n").map((line, index) => (
//                     <p key={index}>{line}</p>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       );
//     }

//     return (
//       <div>
//         {
//           preprocessContent(content).split("\n").map((line, index) => (
//             <p key={index}>{line}</p>
//           ))}
//       </div>
//     );
//   };

//   return (
//     <div className="flex">
//       <div className="flex-grow">
//         {renderContent()}
//       </div>
//     </div>
//   );
// });

// export default BotResponse;





// import React, { useState } from "react";
// import { ResponseMessage } from "@/types";

// interface BotResponseProps {
//   message: ResponseMessage;
// }

// const BotResponse: React.FC<BotResponseProps> = React.memo(function BotResponse({ message }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedContent, setSelectedContent] = useState<string | null>(null);

//   const handleFileClick = (content: string) => {
//     setSelectedContent(content);
//     setIsModalOpen(true);
//   };

//   if (message.type === "chat") {
//     const { content, documentPath } = message;

//     return (
//       <div className="flex flex-col my-2">
//         <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
//           <p className="mb-2">
//             {documentPath ? (
//               <>
//                 You can check the document{" "}
//                 <a
//                   href={documentPath}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 hover:underline"
//                 >
//                   {documentPath.split("/").pop()}
//                 </a>{" "}
//                 below the Uploaded by AI section. If you need any further assistance, feel free to ask!
//               </>
//             ) : (
//               <span>{content}</span>
//             )}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (message.type === "summeraized_docs") {
//     const { docs } = message;

    // return (
    //   <div className="flex flex-col p-2 my-2">
    //     <div className="bg-gray-200 p-4 rounded-lg shadow-sm">
    //       <h3 className="text-lg font-semibold mb-2">Document Summary</h3>
    //       <ul className="list-disc pl-6">
    //         {docs.map((doc, index) => (
    //           <li key={index} className="mb-2">
    //             <strong
    //               onClick={() => handleFileClick(doc.content)}
    //               className="text-blue-500 hover:underline cursor-pointer text-lg"
    //             >
    //               {doc.filename}
    //             </strong>
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //     {isModalOpen && selectedContent && (
    //       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2">
    //         <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
    //           <button
    //             onClick={() => setIsModalOpen(false)}
    //             className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
    //           >
    //             &times;
    //           </button>
    //           <h2 className="text-xl font-bold mb-4">Full Summary</h2>
    //           <div className="max-w-[600px] max-h-[600px] overflow-auto p-2">
    //             <p>{selectedContent}</p>
    //           </div>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // );
//   }

//   return null; 
// });

// export default BotResponse;

import React, { useState } from "react";
import { ResponseMessage } from "@/types";

interface BotResponseProps {
  message: ResponseMessage;
}

const BotResponse: React.FC<BotResponseProps> = React.memo(function BotResponse({ message }) {
  const preprocessContent = (text: string) => text.replace(/\*\*/g, "").split("\\n").join("\n");
  console.log(message,"------------")
  if (message.type === "analysis_report") {
    const { docs } = message;

    return (
      <div className="flex flex-col p-2 my-2">
        <div className="p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Rapporto di analisi
          </h3>
          <ul className="list-disc pl-6">
            {docs.map((doc, index) => (
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
    );
  }

  if (message.type === "summarized_docs") {
    const { docs } = message;
    console.log("uuuuuuuuuuuuuuuuuuuu",docs)

    return (
      <div className="flex flex-col p-2 my-2">
      <div className="p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Riepilogo dei documenti</h3>
        <div className="list-disc pl-6">
          {docs.map((doc, index) => (
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
    );
  }

  if (message.type === "chat") {
    const { content, document_path } = message;

    return (
      <div className="flex flex-col my-2">
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <p className="mb-2">
            {document_path ? (
              <>
                You can check the document{" "}
                <a
                  href={document_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {document_path.split("/").pop()}
                </a>{" "}
                below the Uploaded by AI section. If you need any further assistance, feel free to ask!
              </>
            ) : (
              <span>{
                preprocessContent(content).split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}</span>
            )}
          </p>
        </div>
      </div>
    );
  }
  
  return 

});

export default BotResponse;