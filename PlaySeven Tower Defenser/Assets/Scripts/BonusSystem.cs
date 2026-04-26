using UnityEngine;

public class BonusSystem : MonoBehaviour
{
    public int goldBonus = 20;
    public float damageMultiplier = 1.1f;

    private GameManager gameManager;

    void Start()
    {
        gameManager = FindFirstObjectByType<GameManager>();
    }

    public void ApplyBonus()
    {
        if (gameManager != null)
        {
            gameManager.AddGold(goldBonus);
        }

        Tower[] towers = FindObjectsByType<Tower>(FindObjectsSortMode.None);
        foreach (Tower tower in towers)
        {
            tower.damage = Mathf.RoundToInt(tower.damage * damageMultiplier);
        }
    }
}
