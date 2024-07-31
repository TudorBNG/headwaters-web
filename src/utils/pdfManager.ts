import axios from "axios"

export const uploadFileToPresignedUrl = async ({ user, file, server }) => {
  await axios.post(`${server}/api/presigned-url?user=${user}&filename=${file?.name}&method=put_object`)
    .then(async (response) => {
      if (response.data?.url) {

        await axios.put(response.data.url, file, {
          headers: {
            'Content-Type': "application/pdf", 'x-amz-acl': 'public-read'
          }
        }).catch((error) => {
          console.error('Error on loading file to presigned url');
          throw Error(error?.message)
        })
      } else {
        throw Error('Unable to create presigned url');
      }
    }).catch((error) => {
      console.error('Error on creating presigned url');
      throw Error(error?.message)
    })
}

export const getFileUsingPresignedUrl = async ({ user, filename, server }) => {
  return await axios.post(`${server}/api/presigned-url?user=${user}&filename=${filename}&method=get_object`)
    .then(async (response) => {
      if (response.data?.url) {

        return await fetch(response.data.url, {
          method: 'GET',
        }).catch((error) => {
          console.error('Error on loading file from presigned url');
          throw Error(error?.message)
        })
      }
      else {
        throw Error('Unable to create presigned url');

      }
    }).catch((error) => {
      console.error('Error on creating presigned url');
      throw Error(error?.message)
    })
}

export const getSections = async ({ user, file, server }) => await axios.get(`${server}/api/sections?user=${user}&filename=${file}`)


