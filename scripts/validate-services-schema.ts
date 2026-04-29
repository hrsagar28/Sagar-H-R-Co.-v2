import { buildServicesSchema, SITE_URL } from '../constants/servicesSchema';
import { SERVICES } from '../constants/services';

type SchemaObject = Record<string, any>;

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const isAbsoluteSiteUrl = (value: unknown) => (
  typeof value === 'string' && value.startsWith(`${SITE_URL}/`)
);

const schema = buildServicesSchema() as SchemaObject[];
assert(Array.isArray(schema), 'Services schema must be an array.');
assert(schema.length === 2, 'Services schema must include CollectionPage and AccountingService entries.');

const collection = schema.find((entry) => entry['@type'] === 'CollectionPage');
const organization = schema.find((entry) => entry['@type'] === 'AccountingService');

assert(collection, 'CollectionPage schema is missing.');
assert(organization, 'AccountingService schema is missing.');
assert(collection?.url === `${SITE_URL}/services`, 'CollectionPage URL must point to /services.');
assert(collection?.mainEntity?.['@type'] === 'ItemList', 'CollectionPage mainEntity must be an ItemList.');
assert(collection?.mainEntity?.numberOfItems === SERVICES.length, 'ItemList numberOfItems must match SERVICES length.');
assert(collection?.mainEntity?.itemListElement?.length === SERVICES.length, 'ItemList entries must match SERVICES length.');

collection?.mainEntity?.itemListElement?.forEach((item: SchemaObject, index: number) => {
  const service = SERVICES[index];
  assert(item['@type'] === 'ListItem', `Item ${index + 1} must be a ListItem.`);
  assert(item.position === index + 1, `Item ${index + 1} has an incorrect position.`);
  assert(item.name === service.title, `Item ${index + 1} name must match service title.`);
  assert(item.description === service.description, `Item ${index + 1} description must match service description.`);
  assert(item.url === `${SITE_URL}${service.link}`, `Item ${index + 1} URL must be derived from service.link.`);
});

assert(organization?.['@id'] === `${SITE_URL}/#organization`, 'AccountingService @id is incorrect.');
assert(organization?.name, 'AccountingService name is required.');
assert(organization?.telephone, 'AccountingService telephone is required.');
assert(organization?.address?.['@type'] === 'PostalAddress', 'AccountingService address must be PostalAddress.');
assert(organization?.address?.streetAddress, 'PostalAddress streetAddress is required.');
assert(organization?.address?.addressLocality, 'PostalAddress addressLocality is required.');
assert(organization?.address?.postalCode, 'PostalAddress postalCode is required.');
assert(organization?.address?.addressCountry === 'IN', 'PostalAddress addressCountry must be IN.');

assert((collection?.mainEntity?.itemListElement ?? []).every((item: SchemaObject) => isAbsoluteSiteUrl(item.url)), 'All service URLs must be absolute site URLs.');

console.log('Services JSON-LD schema is well-formed.');
