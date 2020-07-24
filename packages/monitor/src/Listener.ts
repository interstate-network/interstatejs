import { Database } from "./db";

class Listener {
  constructor(
    public db: Database,
    public peg: any,
    public relay: any
  ) {
    
  }
}