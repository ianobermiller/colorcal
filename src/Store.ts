import { createSignal } from 'solid-js';

const [selectedCategoryID, setSelectedCategoryID] = createSignal<null | string>(null);

export { selectedCategoryID, setSelectedCategoryID };
