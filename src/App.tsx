import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useState, useEffect, useRef } from 'react';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { type Artwork, type ApiResponse } from './types/types';

function App() {
  // State variables
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [first, setFirst] = useState<number>(0);
  const rowsPerPage = 12;

  // Selection & debt state
  const [selectedRowIds, setSelectedRowIds] = useState<Record<number, boolean>>({});
  const [owedRows, setOwedRows] = useState<number>(0);
  
  // Overlay panel ref
  const op = useRef<OverlayPanel>(null);
  const [customSelectCount, setCustomSelectCount] = useState<number | ''>('');

  // Handlers
  const onPage = (event: DataTablePageEvent) => {
    setFirst(event.first);
  };

  const onRowSelectionChange = (e: any) => {
    const currentSelection = e.value as Artwork[];
    const newSelectedIds = { ...selectedRowIds };

    artworks.forEach(art => {
      if (!currentSelection.some(selected => selected.id === art.id)) {
        delete newSelectedIds[art.id];
      }
    });

    currentSelection.forEach(art => {
      newSelectedIds[art.id] = true;
    });

    setSelectedRowIds(newSelectedIds);
  };

  const handleCustomSelect = () => {
    if (typeof customSelectCount !== 'number' || customSelectCount <= 0) return;

    let rowsToSelectNow = customSelectCount;
    const newSelectedIds = { ...selectedRowIds };

    for (const art of artworks) {
      if (rowsToSelectNow > 0 && !newSelectedIds[art.id]) {
        newSelectedIds[art.id] = true;
        rowsToSelectNow--;
      }
    }
    
    setSelectedRowIds(newSelectedIds);
    setOwedRows(rowsToSelectNow);
    op.current?.hide();
    setCustomSelectCount('');
  };

  // Data fetching 
  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data: ApiResponse = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  
  // Fetch api data when the page index changes
  useEffect(() => {
    const currentPage = Math.floor(first / rowsPerPage) + 1;
    fetchArtworks(currentPage);
  }, [first]);

  // Automatically select rows on new pages
  useEffect(() => {
    //If we don't owe anything, or the page hasn't loaded data yet, do nothing.
    if (owedRows <= 0 || artworks.length === 0) return;

    // Count how many items on the CURRENT page are actually available to be checked
    let availableToSelect = 0;
    for (const art of artworks) {
      if (!selectedRowIds[art.id]) {
        availableToSelect++;
      }
    }

    // Decide exactly how many boxes we need to check right now
    const itemsToSelectNow = Math.min(owedRows, availableToSelect);

    if (itemsToSelectNow > 0) {
      // Reduce our total debt
      setOwedRows((prev) => prev - itemsToSelectNow);

      //Update the selected checkboxes
      setSelectedRowIds((prev) => {
        const newSelected = { ...prev };
        let remainingToSelect = itemsToSelectNow;

        for (const art of artworks) {
          if (remainingToSelect > 0 && !newSelected[art.id]) {
            newSelected[art.id] = true;
            remainingToSelect--;
          }
        }
        return newSelected;
      });
    }
  }, [artworks, owedRows, selectedRowIds]);

  //Ui
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Art Institute of Chicago</h1>
      
      <OverlayPanel ref={op} className="p-3 shadow-lg border border-gray-200 rounded-md">
        <div className="flex flex-col gap-2">
          <label htmlFor="customSelect" className="text-sm font-semibold text-gray-700">
            Select Rows (Current Page + Future Pages)
          </label>
          <div className="flex gap-2">
            <InputText 
              id="customSelect" 
              type="number" 
              placeholder="Enter number..." 
              value={customSelectCount} 
              onChange={(e) => setCustomSelectCount(Number(e.target.value))} 
              className="w-32 border-gray-300 rounded-md focus:ring-blue-500"
            />
            <Button 
              label="Select" 
              icon="pi pi-check" 
              onClick={handleCustomSelect} 
              className="p-button-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            />
          </div>
        </div>
      </OverlayPanel>

      <div className="card shadow-md rounded-lg overflow-hidden border border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-gray-600 font-medium">
             Selected: <span className="text-blue-600 font-bold">{Object.keys(selectedRowIds).length}</span> 
             {owedRows > 0 && <span className="text-orange-500 ml-2">(Pending: {owedRows})</span>}
          </span>
          <Button 
            type="button" 
            icon="pi pi-chevron-down" 
            label="Custom Selection" 
            onClick={(e) => op.current?.toggle(e)} 
            className="p-button-outlined p-button-secondary bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          />
        </div>

        <DataTable
          value={artworks}
          lazy
          paginator
          first={first}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPage={onPage}
          loading={loading}
          dataKey="id"
          className="min-w-full p-datatable-sm"
          stripedRows
          selection={artworks.filter(art => selectedRowIds[art.id])} 
          onSelectionChange={onRowSelectionChange}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field="title" header="Title" style={{ minWidth: '12rem' }}></Column>
          <Column field="place_of_origin" header="Place of Origin"></Column>
          <Column field="artist_display" header="Artist"></Column>
          <Column 
            field="inscriptions" 
            header="Inscriptions" 
            body={(rowData) => (
              <div className="max-w-xs truncate text-gray-500" title={rowData.inscriptions}>
                {rowData.inscriptions || 'N/A'}
              </div>
            )}
          ></Column>
          <Column field="date_start" header="Start Date"></Column>
          <Column field="date_end" header="End Date"></Column>
        </DataTable>
      </div>
    </div>
  );
}

export default App;