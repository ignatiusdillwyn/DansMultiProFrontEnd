// npm run dev

"use client";
import { useState, useEffect } from "react";
import { text } from "stream/consumers";
import "tailwindcss";

interface Lead {
  id: string;
  name: string;
  email: string;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CampaignForm() {
  // State untuk form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    campaignId: "",
  });
  const [formWord, setFormWord] = useState({
    word: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State untuk tabel leads
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const [word, setWord] = useState("");
  const [resultSentiment, setResultSentiment] = useState("");

  // Fetch leads data
  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const response = await fetch("http://localhost:3001/leads/getLeads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log('response ', response)
      const data = await response.json();
      console.log('data ', data)

      if (data.status === 200) {
        console.log('response oke ')
        setLeads(data.data);
        setTotalPages(Math.ceil(data.data.length / itemsPerPage));
      } else {
        console.error("Failed to fetch leads:", data.message);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeWord = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormWord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/leads/createLeads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Lead berhasil dibuat!");
        setFormData({
          name: "",
          email: "",
          campaignId: "",
        });
        // Refresh leads data after successful creation
        fetchLeads();
      } else {
        setMessage(`Error: ${data.message || "Gagal membuat lead"}`);
      }
    } catch (error) {
      setMessage("Terjadi kesalahan jaringan");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setWord("");
    const requestData = {
      text: formWord.word
    }
    try {
      const response = await fetch("http://localhost:3001/leads/checkWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      let result = ''
      let status = 0
      let result2 = await response.json()
      console.log('result2 ', result2.data)
      await response.json().then((data) => {
        console.log('data ', data)
        status = data.status
        result = data.data.sentiment

        if (status === 200) {
          result = data.data.sentiment
          // console.log('result ', result)  
          setResultSentiment(result)
          setFormWord({
            word: "",
          })
        } else {
          setResultSentiment(`Error: Gagal Analisa kata-kata`)
        }
      });

    } catch (error) {
      setMessage("Terjadi kesalahan jaringan");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = leads.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col flex justify-evenly">
      <h1>Lead Management System</h1>

      <div>
        {/* Form Section */}
        <div>
          <h2>Create New Lead</h2>

          {message && (
            <div>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="border-4 border-indigo-500/100">
              <label htmlFor="name">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label htmlFor="campaignId">
                Campaign ID *
              </label>
              <input
                type="text"
                id="campaignId"
                name="campaignId"
                value={formData.campaignId}
                onChange={handleChange}
                placeholder="Enter campaign ID"
                required
              />
            </div>

            <button
              className="bg-indigo-500 hover:bg-fuchsia-500 rounded-md p-1 mt-2 mb-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Lead"}
            </button>
          </form>
        </div>

        {/* Leads Table Section */}
        <div>
          <div className="mb-3">
            <h2>Leads List</h2>
            <button
              onClick={fetchLeads}
              disabled={isLoadingLeads}
            >
              {isLoadingLeads ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {isLoadingLeads ? (
            <div>
              <div></div>
              <p>Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div>
              No leads found. Create your first lead!
            </div>
          ) : (
            <>
              <div className="mb-3">
                <table className="border-separate border-spacing-1 border border-gray-400 dark:border-gray-500">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 ...">
                        No
                      </th>
                      <th className="border border-gray-300 ...">
                        Name
                      </th>
                      <th className="border border-gray-300 ...">
                        Email
                      </th>
                      <th className="border border-gray-300 ...">
                        Campaign ID
                      </th>
                      <th className="border border-gray-300 ...">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeads.map((lead, index) => (
                      <tr>
                        <td className="border border-gray-300 ...">
                          {startIndex + index + 1}
                        </td>
                        <td className="border border-gray-300 ...">
                          {lead.name}
                        </td>
                        <td className="border border-gray-300 ...">
                          {lead.email}
                        </td>
                        <td className="border border-gray-300 ...">
                          <span>
                            {lead.campaignId}
                          </span>
                        </td>
                        <td className="border border-gray-300 ...">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div>
                  <div>
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span>{Math.min(endIndex, leads.length)}</span> of{" "}
                    <span>{leads.length}</span> leads
                  </div>

                  <div>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div>
        <div>
          <h3>Total Leads</h3>
          <p>{leads.length}</p>
        </div>
        <div>
          <h3>Current Page</h3>
          <p>{currentPage} / {totalPages}</p>
        </div>
        {/* <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Items Per Page</h3>
            <p className="text-2xl font-bold mt-2">{itemsPerPage}</p>
          </div> */}
      </div>

      <div>
        <h1>Analyze Word</h1>
        <form onSubmit={analyzeWord}>
          <div>
            <label htmlFor="word">
              Input Word *
            </label>
            <input
              type="text"
              id="word"
              name="word"
              value={formWord.word}
              onChange={handleChangeWord}
              placeholder="Enter Word"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Word"}
          </button>
          <h3>{resultSentiment}</h3>
        </form>
      </div>
    </div>
  );
}