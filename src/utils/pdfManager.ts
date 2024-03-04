import axios from "axios"

export const uploadFileToPresignedUrl = async ({ user, file, server }) => {
  await axios.post(`${server}/api/generate-presigned-url?user=${user}&filename=${file?.name}`)
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
