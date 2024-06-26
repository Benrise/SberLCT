import { makeAutoObservable, runInAction } from 'mobx';
import { http } from '../api';
import { BaseDto, IBaseListParams, IBaseListResponse } from '@/shared/api/types';
import { StatusCodes } from 'http-status-codes';
import { ConfigurationDto, ConfigurationFormValues } from '@/widgets/constructor/model/types';
import { DataframeNamesEnum, EditableCellDto } from './types';
import { DistributionDto } from '@/entities/distribution/model';

export class TableStore {

  tableData: IBaseListResponse<Record<string, string>>  = {
    data: [],
    meta: {}
  }
  bills: BaseDto[] = [];
  distributions: DistributionDto[] = [];
  importedConfigurations: ConfigurationDto[] = [];
  configurations?: ConfigurationDto[] 
  loading = {
    list: false,
    item: false,
    create: false,
    update: false,
    delete: false,
    filter: false
  };
  cellLoading: Record<string, boolean> = {};
  sort: IBaseListParams = {}

  constructor() {
    makeAutoObservable(this);
  }

  async fetchBills() {
    this.setLoading('list', true);
    try {
      const response = await http.table.bills();
      runInAction(() => {
        this.bills = response.data;
      });
    } catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('list', false);
    }
  }

  async setImportedConfigurations(configurations: ConfigurationDto[]) {
    runInAction(() => {
      this.importedConfigurations = configurations
    });
  }

  async setConfigurations(configurations: ConfigurationDto[]) {
    runInAction(() => {
      this.configurations = configurations
    });
  }

  async preloadTable(dfName?: string) {
    this.setLoading('item', true);
    try {
      const response = await http.table.pre_load_table(dfName);
      if (response.status === StatusCodes.OK) {
        return response.data.message
      }
    } catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('item', false);
    }
  }

  async loadTable(file: File | null) {
    this.setLoading('create', true);
    try {
      const response = await http.table.load_table(file);
      if (response.status === StatusCodes.OK) {
        runInAction(() => {
          this.fetchBills();
        }); 
      }
      return response.data.message;
    } catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('create', false);
    }
  }

  async deleteTable(fileName: string, dfName?: string) {
    this.setLoading('delete', true);
    try {
      const response = await http.table.delete_table(fileName, dfName);
      if (response.status === StatusCodes.OK) {
        runInAction(() => {
          this.fetchBills();
        });
        return response.data.message;
      }
    } catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('delete', false);
    }
  }

  async getTable(dfName?: DataframeNamesEnum, params: IBaseListParams = {
    pg: 0,
    n: 15,
    column: this.sort.column,
    sort: this.sort.sort,
  }) {
    this.setLoading('item', true);
    try {
      let response = await http.table.get_table(dfName, params);
      if (!response.data.data) {
        response = await http.table.get_table(DataframeNamesEnum.BILLS, params);
      }
      if (typeof(response.data) === 'string') {
        return
      }
      runInAction(() => {
        this.tableData = response.data
      })
      if (response.status === StatusCodes.OK) {
        return response.data
      }
    } catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('item', false);
    }
  }
  
  setSort(column: string, sort: 'asc' | 'desc') {
    runInAction(() => {    
      this.sort.column = column;
      this.sort.sort = sort;
    })
  }

  async history() {
    this.setLoading('list', true);
    try {
      const response = await http.table.history();
      if (response.status === StatusCodes.OK) {
        runInAction(() => {
          this.distributions = response.data
        })
      }
    } catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('list', false);
    }
  }

  async filter(dfName?: string, params?: ConfigurationFormValues){
    this.setLoading('filter', true);
    try {
      const response = await http.table.filter(dfName, params);
      if (response.status === StatusCodes.OK) {
        setTimeout(async () => {
          await this.getTable(DataframeNamesEnum.FILTER);
      }, 3000);
        if (response.data.message) {
          return response.data.message
        }
      }
    }
    catch (error: any) {
      console.log(error);
    }
    finally {
      this.setLoading('filter', false);
    }
  }

  async updateCell(rowIndex: number, columnId: string, value: string) {
    const cellKey = `${rowIndex}-${columnId}`;
    this.setCellLoading(cellKey, true);
    const updatedData = this.tableData.data.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          [columnId]: value as string,
        };
      }
      return row;
    });

    runInAction(() => {
      this.tableData.data = updatedData;
    });
    await this.edit_cell({ row: [rowIndex], column: columnId, value: value?.toString() || '---' });
    this.setCellLoading(cellKey, false);
  }

  async edit_cell(payload: EditableCellDto) {
    try {
      await http.table.edit_cell(payload);
    }
    catch (error: any) {
      console.log(error);
    }
  }

  setCellLoading(cellKey: string, state: boolean) {
    runInAction(() => {
      this.cellLoading[cellKey] = state;
    });
  }

  setLoading(operation: keyof typeof this.loading, state: boolean) {
    if (state === this.loading[operation]) return;
    runInAction(() => {
      this.loading[operation] = state;
    });
  }
}

export const tableStore = new TableStore();