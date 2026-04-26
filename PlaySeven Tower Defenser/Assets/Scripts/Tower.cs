using UnityEngine;

public class Tower : MonoBehaviour
{
    public float range = 10f;
    public float fireRate = 1f;
    public int damage = 20;
    public int level = 1;
    public int maxLevel = 3;
    public int[] upgradeCosts = { 50, 100 };
    public GameObject projectilePrefab;
    public Transform firePoint;

    private float fireCooldown = 0f;

    void Update()
    {
        if (GameManager.Instance != null && GameManager.Instance.IsGameOver) return;

        fireCooldown -= Time.deltaTime;
        if (fireCooldown <= 0f)
        {
            Enemy target = FindTarget();
            if (target != null)
            {
                Shoot(target);
                fireCooldown = 1f / fireRate;
            }
        }
    }

    Enemy FindTarget()
    {
        Enemy[] enemies = FindObjectsOfType<Enemy>();
        Enemy closestEnemy = null;
        float closestDistance = range;

        foreach (Enemy enemy in enemies)
        {
            float distance = Vector3.Distance(transform.position, enemy.transform.position);
            if (distance <= closestDistance)
            {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        return closestEnemy;
    }

    void Shoot(Enemy target)
    {
        if (projectilePrefab == null) return;

        Vector3 spawnPosition = firePoint != null ? firePoint.position : transform.position + Vector3.up;
        GameObject projectileObj = Instantiate(projectilePrefab, spawnPosition, Quaternion.identity);
        Projectile projectile = projectileObj.GetComponent<Projectile>();
        if (projectile != null)
        {
            projectile.SetTarget(target, damage);
        }
    }

    public bool CanUpgrade()
    {
        if (GameManager.Instance == null) return false;
        if (level >= maxLevel) return false;

        int cost = GetUpgradeCost();
        return cost > 0 && GameManager.Instance.GetGold() >= cost;
    }

    public int GetUpgradeCost()
    {
        int costIndex = level - 1;
        if (costIndex < 0 || costIndex >= upgradeCosts.Length) return 0;

        return upgradeCosts[costIndex];
    }

    public void Upgrade()
    {
        if (!CanUpgrade()) return;

        int cost = GetUpgradeCost();
        if (!GameManager.Instance.SpendGold(cost)) return;

        level++;
        damage += 10;
        range += 1.5f;
        fireRate += 0.25f;
        transform.localScale *= 1.08f;
    }

    void OnMouseDown()
    {
        Upgrade();
    }
}
