const catalogImages = [
  '/catalog/uniforme-03-page-1.jpeg',
  '/catalog/uniforme-04-page-1.jpeg',
  '/catalog/uniforme-02-page-1.jpeg',
  '/catalog/uniforme-01-page-1.jpeg',
  '/catalog/uniforme-09-page-2.jpeg',
  '/catalog/uniforme-06-page-2.jpeg',
  '/catalog/uniforme-08-page-2.jpeg',
  '/catalog/uniforme-10-page-2.jpeg',
  '/catalog/uniforme-05-page-2.jpeg',
  '/catalog/uniforme-07-page-2.jpeg',
  '/catalog/uniforme-15-page-4.jpeg',
  '/catalog/uniforme-16-page-4.jpeg',
]

export function getCatalogImage(index = 0) {
  return catalogImages[index % catalogImages.length]
}