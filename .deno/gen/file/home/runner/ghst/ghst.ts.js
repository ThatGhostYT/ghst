export class GhstApplication {
    _requests;
    _middleware;
    constructor(options) {
        this._requests = {};
        if (options)
            this._middleware = options.middleware;
        else
            this._middleware = [];
    }
    onRequest(path, method, callback) {
        this._requests[path] = {
            method,
            callback
        };
    }
    listen(port, callback) {
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9ob21lL3J1bm5lci9naHN0L2doc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBc0JBLE1BQU0sT0FBTyxlQUFlO0lBQ25CLFNBQVMsQ0FBdUI7SUFDaEMsV0FBVyxDQUFnQztJQUVuRCxZQUFZLE9BQTJCO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBRXBCLElBQUcsT0FBTztZQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7WUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVNLFNBQVMsQ0FBQyxJQUFZLEVBQUMsTUFBZSxFQUFDLFFBQThCO1FBQzNFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDdEIsTUFBTTtZQUNOLFFBQVE7U0FDUixDQUFBO0lBQ0YsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFZLEVBQUMsUUFBcUI7SUFFaEQsQ0FBQztDQUNEIn0=