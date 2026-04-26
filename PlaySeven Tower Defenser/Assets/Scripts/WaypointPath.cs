using System.Collections.Generic;
using UnityEngine;

public class WaypointPath : MonoBehaviour
{
    public List<Transform> waypoints = new List<Transform>();
    public int Count { get { return waypoints.Count; } }

    void Awake()
    {
        waypoints.Clear();

        foreach (Transform child in transform)
        {
            waypoints.Add(child);
        }
    }

    public Transform GetWaypoint(int index)
    {
        if (index < 0 || index >= waypoints.Count) return null;

        return waypoints[index];
    }
}
