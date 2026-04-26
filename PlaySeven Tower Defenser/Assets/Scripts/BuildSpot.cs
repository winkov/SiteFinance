using UnityEngine;

public class BuildSpot : MonoBehaviour
{
    public GameObject towerPrefab;
    public int buildCost = 50;

    private GameManager gameManager;
    private bool hasTower = false;

    void Start()
    {
        gameManager = FindAnyObjectByType<GameManager>();
    }

    void OnMouseDown()
    {
        if (hasTower) return;
        if (BuildManager.Instance != null && !BuildManager.Instance.IsBuildModeActive) return;
        if (gameManager == null || towerPrefab == null) return;

        if (gameManager.SpendGold(buildCost))
        {
            Instantiate(towerPrefab, transform.position, Quaternion.identity);
            hasTower = true;

            if (BuildManager.Instance != null)
            {
                BuildManager.Instance.SetBuildMode(false);
            }
        }
    }
}
