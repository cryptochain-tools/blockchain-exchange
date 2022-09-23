import {
  InverseClient,
  LinearClient,
  InverseFuturesClient,
  SpotClientV3,
  UnifiedMarginClient,
  USDCOptionClient,
  USDCPerpetualClient,
  AccountAssetClient,
  CopyTradingClient,
} from "bybit-api"

export class Bybit {
  private client: UnifiedMarginClient
  constructor() {
    this.client = new UnifiedMarginClient({
      key: "1mUt3Axdpg88Syir3x",
      secret: "PQktcC49QsUmc33tVg7qTm3DFeOBZ1YoP3Wo",
    })
    this.getOrder()
  }

  async getOrder() {
    const data = await this.client.getPositions({ category: "linear" })
    console.log(data, "datadata")
    // this.client.getOpenInterest
  }
}
