sealed class RayCastVisibility : Visibility
{
  /// <param name="mapSize">The size of the map.</param>
  /// <param name="blocksLight">A function that accepts the X and Y coordinates of a tile and determines
  /// whether the given tile blocks the passage of light.
  /// </param>
  /// <param name="setVisible">A function that sets a tile to be visible, given its X and Y coordinates.</param>
  /// <param name="getDistance">A function that a pair of X and Y coordinates and returns the distance
  /// between the two points.
  /// </param>
  public RayCastVisibility(Size mapSize, Func<int,int,bool> blocksLight, Action<int,int> setVisible,
                           Func<int,int,int,int,int> getDistance)
  {
    MapSize     = mapSize;
    BlocksLight = blocksLight;
    SetVisible  = setVisible;
    GetDistance = getDistance;
  }

  public override void Compute(LevelPoint origin, int rangeLimit)
  {
    SetVisible(origin.X, origin.Y);
    if(rangeLimit != 0)
    {
      Rectangle area = new Rectangle(0, 0, MapSize.Width, MapSize.Height); // cast to the edge of the map by default
      if(rangeLimit >= 0) // but limit the area to the rectangle containing the sight radius if one was provided
      {
        area.Intersect(new Rectangle(origin.X-rangeLimit, origin.Y-rangeLimit, rangeLimit*2+1, rangeLimit*2+1));
      }
      for(int x=area.Left; x<area.Right; x++) // cast rays towards the top and bottom of the area
      {
        TraceLine(origin, x, area.Top, rangeLimit);
        TraceLine(origin, x, area.Bottom-1, rangeLimit);
      }
      for(int y=area.Top+1; y<area.Bottom-1; y++) // and to the left and right
      {
        TraceLine(origin, area.Left, y, rangeLimit);
        TraceLine(origin, area.Right-1, y, rangeLimit);
      }
    }
  }

  void TraceLine(LevelPoint origin, int x2, int y2, int rangeLimit)
  {
    int xDiff = x2 - origin.X, yDiff = y2 - origin.Y, xLen = Math.Abs(xDiff), yLen = Math.Abs(yDiff);
    int xInc = Math.Sign(xDiff), yInc = Math.Sign(yDiff)<<16, index = (origin.Y<<16) + origin.X;
    if(xLen < yLen) // make sure we walk along the long axis
    {
      Utility.Swap(ref xLen, ref yLen);
      Utility.Swap(ref xInc, ref yInc);
    }
    int errorInc = yLen*2, error = -xLen, errorReset = xLen*2;
    while(--xLen >= 0) // skip the first point (the origin) since it's always visible and should never stop rays
    {
      index += xInc; // advance down the long axis (could be X or Y)
      error += errorInc;
      if(error > 0) { error -= errorReset; index += yInc; }
      int x = index & 0xFFFF, y = index >> 16;
      if(rangeLimit >= 0 && GetDistance(origin.X, origin.Y, x, y) > rangeLimit) break;
      SetVisible(x, y);
      if(BlocksLight(x, y)) break;
    }
  }

  readonly Size MapSize;
  readonly Func<int, int, bool> BlocksLight;
  readonly Func<int, int, int, int, int> GetDistance;
  readonly Action<int, int> SetVisible;
}
