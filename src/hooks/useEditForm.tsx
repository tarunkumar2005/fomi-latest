import axios from "axios";

export const getFormHeaderData = async (slug: string) => {
  const response = await axios.get(`/api/forms/edit?slug=${slug}`);
  return response.data;
}

export const useEditForm = () => {
  return {
    getFormHeaderData,
  };
}