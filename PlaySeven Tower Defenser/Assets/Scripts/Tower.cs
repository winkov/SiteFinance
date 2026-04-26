using UnityEngine;

public class Tower : MonoBehaviour
{
    public float range = 8f;
    public float fireRate = 1f;
    public int damage = 20;
    public GameObject projectilePrefab;
    public Transform firePoint;

    private float fireTimer;

    void Update()
    {
        fireTimer -= Time.deltaTime;

        if (fireTimer <= 0f)
        {
            Enemy target = FindNearestEnemy();

            if (target != null)
            {
                Shoot(target);
                fireTimer = 1f / fireRate;
            }
        }
    }

    Enemy FindNearestEnemy()
    {
        Enemy[] enemies = FindObjectsByType<Enemy>(FindObjectsSortMode.None);
        Enemy nearestEnemy = null;
        float nearestDistance = range;

        foreach (Enemy enemy in enemies)
        {
            float distance = Vector3.Distance(transform.position, enemy.transform.position);

            if (distance <= nearestDistance)
            {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }

        return nearestEnemy;
    }

    void Shoot(Enemy target)
    {
        if (projectilePrefab == null)
        {
            return;
        }

        Vector3 spawnPosition = transform.position + Vector3.up;

        if (firePoint != null)
        {
            spawnPosition = firePoint.position;
        }

        GameObject projectileObject = Instantiate(projectilePrefab, spawnPosition, Quaternion.identity);
        Projectile projectile = projectileObject.GetComponent<Projectile>();

        if (projectile != null)
        {
            projectile.SetTarget(target, damage);
        }
    }

    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, range);
    }
}
